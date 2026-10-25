import { validateContact, leadText, type ContactInput, type FieldErrors, type Lead } from '../contact'

const WA = 'https://wa.me/972538007008'
const FIELDS: (keyof ContactInput)[] = ['name', 'phone', 'service', 'message']

// The lead form. Validates in the browser with the same rules the server uses,
// posts to the endpoint, and reports exactly what happened. When no delivery
// is configured (or there is no server, as in the preview) it says so and
// finishes on WhatsApp with the details already written; it never claims a
// message was sent when it was not.
export function initForm(endpoint: string | null) {
  const found = document.querySelector<HTMLFormElement>('[data-lead-form]')
  if (!found) return () => {}
  const form: HTMLFormElement = found
  const status = form.querySelector<HTMLElement>('[data-status]')!
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!
  const startedAt = Date.now()
  const touched: Partial<Record<keyof ContactInput, boolean>> = {}
  let sending = false

  const el = (k: keyof ContactInput) => form.elements.namedItem(k) as HTMLInputElement
  const values = (): ContactInput => ({ name: el('name').value, phone: el('phone').value, service: el('service').value, message: el('message').value })

  function paint(errors: FieldErrors) {
    for (const k of FIELDS) {
      const input = el(k), id = `f-${k}-err`
      document.getElementById(id)?.remove()
      const msg = touched[k] && errors[k]
      const hint = k === 'phone' ? document.getElementById('f-phone-hint') : null
      if (msg) {
        const p = document.createElement('p')
        p.id = id; p.className = 'field__error'; p.textContent = msg
        input.closest('.field')!.appendChild(p)
        input.setAttribute('aria-invalid', 'true')
        input.setAttribute('aria-describedby', id)
        if (hint) hint.hidden = true
      } else {
        input.removeAttribute('aria-invalid')
        if (hint) { hint.hidden = false; input.setAttribute('aria-describedby', 'f-phone-hint') } else input.removeAttribute('aria-describedby')
      }
    }
  }

  function show(kind: 'success' | 'error' | 'handoff', title: string, text: string, lead?: Lead) {
    status.hidden = false
    status.className = `form-status${kind === 'success' ? ' is-success' : kind === 'error' ? ' is-error' : ''}`
    status.innerHTML = ''
    const h = document.createElement('h3'); h.textContent = title
    const p = document.createElement('p'); p.textContent = text
    status.append(h, p)
    if (lead) {
      const a = document.createElement('a')
      a.className = 'btn btn--light'; a.target = '_blank'; a.rel = 'noopener noreferrer'
      a.href = `${WA}?text=${encodeURIComponent(leadText(lead))}`
      a.textContent = 'שליחה בוואטסאפ'
      status.append(a)
    }
    status.focus()
  }

  const onInput = (e: Event) => {
    const k = (e.target as HTMLInputElement).name as keyof ContactInput
    if (!FIELDS.includes(k) || !touched[k]) return
    const r = validateContact(values()); paint(r.ok ? {} : r.errors)
  }
  const onBlur = (e: FocusEvent) => {
    const k = (e.target as HTMLInputElement).name as keyof ContactInput
    if (!FIELDS.includes(k)) return
    // Heading for the submit button: let submit validate everything at once,
    // or the error appearing here would move the button mid-click.
    if ((e.relatedTarget as HTMLElement | null)?.matches?.('[data-submit]')) return
    touched[k] = true
    const r = validateContact(values()); paint(r.ok ? {} : r.errors)
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (sending) return
    FIELDS.forEach(k => { touched[k] = true })
    const r = validateContact(values())
    if (!r.ok) {
      paint(r.errors)
      const first = FIELDS.find(k => r.errors[k]); if (first) el(first).focus()
      return
    }
    paint({})
    const handoff = () => show('handoff', 'עוד צעד אחד: שליחה בוואטסאפ', 'הטופס עדיין לא מחובר לתיבת דואר, אז הפרטים לא נשלחו מכאן. הם כבר כתובים בהודעה: לוחצים ושולחים.', r.lead)
    if (!endpoint) { handoff(); return }

    sending = true
    submit.disabled = true
    submit.setAttribute('aria-busy', 'true')
    submit.firstChild!.textContent = 'שולח… '
    try {
      const company = (form.elements.namedItem('company') as HTMLInputElement).value
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values(), company, elapsed: Date.now() - startedAt }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        show('success', 'הפנייה התקבלה. תודה!', 'נחזור אליכם למספר שהשארתם. אם זה דחוף, אפשר גם לכתוב לנו בוואטסאפ.')
        form.reset()
      } else if (data.reason === 'not_configured' || res.status === 404) handoff()
      else if (res.status === 422 && data.errors) { paint(data.errors); status.hidden = true }
      else if (res.status === 429) show('error', 'נשלחו יותר מדי פניות', 'אפשר לנסות שוב בעוד כמה דקות, או לשלוח את הפרטים בוואטסאפ.', r.lead)
      else show('error', 'השליחה לא הצליחה', 'הפרטים שמורים. אפשר לשלוח אותם בוואטסאפ בלחיצה אחת.', r.lead)
    } catch {
      show('error', 'אין חיבור כרגע', 'הפרטים שמורים. אפשר לשלוח אותם בוואטסאפ בלחיצה אחת.', r.lead)
    } finally {
      sending = false
      submit.disabled = false
      submit.removeAttribute('aria-busy')
      submit.firstChild!.textContent = 'שליחת פרטים '
    }
  }

  // "לבקש הצעה" on a service card preselects that service.
  const onPreselect = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLElement>('[data-service]')
    if (a?.dataset.service) el('service').value = a.dataset.service
  }

  form.addEventListener('input', onInput)
  form.addEventListener('focusout', onBlur)
  form.addEventListener('submit', onSubmit)
  document.addEventListener('click', onPreselect)
  return () => {
    form.removeEventListener('input', onInput)
    form.removeEventListener('focusout', onBlur)
    form.removeEventListener('submit', onSubmit)
    document.removeEventListener('click', onPreselect)
  }
}
