'use client'

import { useEffect, useRef, useState } from 'react'
import { SERVICE_OPTIONS, validateContact, leadText, type FieldErrors, type ContactInput, type Lead } from '@/lib/contact'
import { whatsappUrl } from '@/lib/site'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'handoff'; lead: Lead } // no server delivery configured: finish on WhatsApp
  | { kind: 'error'; message: string; lead?: Lead }

const FIELDS: (keyof ContactInput)[] = ['name', 'phone', 'service', 'message']

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>({ name: '', phone: '', service: '', message: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ContactInput, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const startedAt = useRef(Date.now())
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  // "בואו נדבר על דפי נחיתה" links in the services section preselect the service.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-service]')
      if (a?.dataset.service) setValues(v => ({ ...v, service: a.dataset.service! }))
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (status.kind === 'sent' || status.kind === 'handoff' || status.kind === 'error') statusRef.current?.focus()
  }, [status])

  const set = (k: keyof ContactInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...values, [k]: e.target.value }
    setValues(next)
    if (touched[k]) {
      const r = validateContact(next)
      setErrors(r.ok ? {} : r.errors)
    }
  }
  const blur = (k: keyof ContactInput) => (e: React.FocusEvent) => {
    // Heading for the submit button: let submit validate everything at once.
    // Showing this field's error now would push the button down between
    // mousedown and mouseup, and the click would never land.
    if ((e.relatedTarget as HTMLElement | null)?.matches?.('button[type=submit]')) return
    setTouched(t => ({ ...t, [k]: true }))
    const r = validateContact(values)
    setErrors(e => ({ ...e, [k]: r.ok ? undefined : r.errors[k] }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status.kind === 'sending') return
    const r = validateContact(values)
    setTouched({ name: true, phone: true, service: true, message: true })
    if (!r.ok) {
      setErrors(r.errors)
      const first = FIELDS.find(f => r.errors[f])
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }
    setErrors({})
    setStatus({ kind: 'sending' })
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, company: fd.get('company') ?? '', elapsed: Date.now() - startedAt.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) { setStatus({ kind: 'sent' }); return }
      if (data.reason === 'not_configured') { setStatus({ kind: 'handoff', lead: r.lead }); return }
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus({ kind: 'idle' }); return }
      if (res.status === 429) { setStatus({ kind: 'error', message: 'נשלחו יותר מדי פניות מהדפדפן הזה. אפשר לנסות שוב בעוד כמה דקות, או לכתוב לנו בוואטסאפ.', lead: r.lead }); return }
      setStatus({ kind: 'error', message: 'משהו השתבש בשליחה. הפרטים שמורים, אפשר לשלוח אותם בוואטסאפ.', lead: r.lead })
    } catch {
      setStatus({ kind: 'error', message: 'אין חיבור כרגע. הפרטים שמורים, אפשר לשלוח אותם בוואטסאפ.', lead: r.lead })
    }
  }

  if (status.kind === 'sent') {
    return (
      <div ref={statusRef} tabIndex={-1} className="form-status" role="status">
        <h3>הפנייה התקבלה. תודה!</h3>
        <p>נחזור אליכם לטלפון שהשארתם. אם זה דחוף, אפשר גם לכתוב לנו בוואטסאפ.</p>
      </div>
    )
  }

  const err = (k: keyof ContactInput) => (touched[k] ? errors[k] : undefined)
  const fieldProps = (k: keyof ContactInput) => ({
    id: `f-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    onBlur: blur(k),
    'aria-invalid': err(k) ? true : undefined,
    'aria-describedby': err(k) ? `f-${k}-err` : k === 'phone' ? 'f-phone-hint' : undefined,
    className: 'input',
  })

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit} aria-labelledby="contact-title">
      <div className="field">
        <label htmlFor="f-name">שם</label>
        <input {...fieldProps('name')} type="text" autoComplete="name" required maxLength={80} />
        {err('name') && <p id="f-name-err" className="field__error">{err('name')}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-phone">טלפון</label>
        <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required placeholder="050-1234567" style={{ textAlign: 'right' }} />
        {err('phone') ? <p id="f-phone-err" className="field__error">{err('phone')}</p> : <p id="f-phone-hint" className="field__hint">נחזור אליכם למספר הזה.</p>}
      </div>

      <div className="field">
        <label htmlFor="f-service">סוג שירות</label>
        <select {...fieldProps('service')} required>
          <option value="" disabled>בחרו שירות</option>
          {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {err('service') && <p id="f-service-err" className="field__error">{err('service')}</p>}
      </div>

      <div className="field">
        <label htmlFor="f-message">כמה מילים על העסק ועל מה שצריך <span className="opt">(לא חובה)</span></label>
        <textarea {...fieldProps('message')} rows={4} maxLength={1000} />
        {err('message') && <p id="f-message-err" className="field__error">{err('message')}</p>}
      </div>

      {/* Honeypot: invisible to people, irresistible to form bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">חברה</label>
        <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" className="btn btn--solid" disabled={status.kind === 'sending'} aria-busy={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'שולח…' : 'שליחת פרטים'}
        </button>
        <p className="form__note">הפרטים משמשים רק כדי לחזור אליכם בנוגע לפנייה.</p>
      </div>

      {(status.kind === 'handoff' || status.kind === 'error') && (
        <div ref={statusRef} tabIndex={-1} className="form-status" role={status.kind === 'error' ? 'alert' : 'status'}>
          {status.kind === 'handoff' ? (
            <>
              <h3>עוד צעד אחד: שליחה בוואטסאפ</h3>
              <p>הפרטים כבר כתובים בהודעה. לוחצים, ושולחים.</p>
            </>
          ) : (
            <p>{status.message}</p>
          )}
          {status.lead && (
            <a href={whatsappUrl(leadText(status.lead))} target="_blank" rel="noopener noreferrer" className="btn btn--solid mt-4">
              שליחה בוואטסאפ
            </a>
          )}
        </div>
      )}
    </form>
  )
}
