import { validateContact, leadText, escapeHtml, formatPhone, type Lead } from '@/lib/contact'

// Leads: validated here (the browser check is only a convenience), then sent
// to whichever destination is configured. With none configured the route says
// so, and the form hands the visitor over to WhatsApp with their details.

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const MIN_FILL_MS = 2500
const MAX_BODY = 8 * 1024

// Per-instance memory. Enough to blunt a burst from one client; a shared
// store (Upstash, KV) is the upgrade if abuse ever appears.
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k)
  return recent.length > MAX_PER_WINDOW
}

function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return true // same-origin fetches from older browsers may omit it
  try {
    return new URL(origin).host === (req.headers.get('x-forwarded-host') || req.headers.get('host'))
  } catch {
    return false
  }
}

async function deliver(lead: Lead): Promise<'sent' | 'not_configured' | 'failed'> {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, CONTACT_WEBHOOK_URL } = process.env

  if (RESEND_API_KEY && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL) {
    const rows = [
      ['שם', lead.name],
      ['טלפון', formatPhone(lead.phone)],
      ['שירות', lead.serviceLabel],
      ['פרטים', lead.message || '-'],
    ]
    const html = `<div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px">
      <h2 style="margin:0 0 12px">פנייה חדשה מהאתר</h2>
      <table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
    </div>`
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL.split(',').map(s => s.trim()),
        subject: `פנייה חדשה: ${lead.serviceLabel} | ${lead.name}`,
        html,
        text: leadText(lead),
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null)
    return res?.ok ? 'sent' : 'failed'
  }

  if (CONTACT_WEBHOOK_URL) {
    const res = await fetch(CONTACT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...lead, phoneDisplay: formatPhone(lead.phone), text: leadText(lead), receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    }).catch(() => null)
    return res?.ok ? 'sent' : 'failed'
  }

  return 'not_configured'
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ ok: false, reason: 'forbidden' }, { status: 403 })
  if (!(req.headers.get('content-type') || '').includes('application/json')) {
    return Response.json({ ok: false, reason: 'bad_request' }, { status: 415 })
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY) return Response.json({ ok: false, reason: 'too_large' }, { status: 413 })
  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
  } catch {
    return Response.json({ ok: false, reason: 'bad_request' }, { status: 400 })
  }

  // Bots: a filled honeypot or an inhumanly fast submit gets a quiet "ok" so
  // they learn nothing, and nothing is delivered.
  const elapsed = Number(body.elapsed)
  if ((typeof body.company === 'string' && body.company.trim()) || (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS)) {
    return Response.json({ ok: true })
  }

  // x-real-ip is set by the platform (Vercel and most proxies). Failing that,
  // the last x-forwarded-for hop is the one our own proxy appended; the first
  // is whatever the client claimed, so it is never trusted.
  const ip = req.headers.get('x-real-ip') || (req.headers.get('x-forwarded-for') || '').split(',').pop()!.trim() || 'unknown'
  if (limited(ip)) return Response.json({ ok: false, reason: 'rate_limited' }, { status: 429 })

  const result = validateContact(body)
  if (!result.ok) return Response.json({ ok: false, reason: 'invalid', errors: result.errors }, { status: 422 })

  const outcome = await deliver(result.lead)
  if (outcome === 'sent') return Response.json({ ok: true })
  if (outcome === 'not_configured') return Response.json({ ok: false, reason: 'not_configured' }, { status: 503 })
  console.error('[contact] delivery failed')
  return Response.json({ ok: false, reason: 'delivery_failed' }, { status: 502 })
}
