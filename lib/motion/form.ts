import { validateContact, leadText, type ContactInput, type FieldErrors } from '../contact'
import { whatsappUrl } from '../site'

const FIELDS: (keyof ContactInput)[] = ['name', 'phone', 'service', 'message']

// The lead form. Validates in the browser, then opens WhatsApp to the studio's
// number with everything the visitor wrote already in the message. WhatsApp
// still needs the visitor to press send; the page never claims a message was
// sent, and tells screen readers that WhatsApp opened.
export function initForm() {
  const found = document.querySelector<HTMLFormElement>('[data-lead-form]')
  if (!found) return () => {}
  const form: HTMLFormElement = found
  const status = form.querySelector<HTMLElement>('[data-status]')!
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!
  const touched: Partial<Record<keyof ContactInput, boolean>> = {}

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

  function onSubmit(e: SubmitEvent) {
    e.preventDefault()
    // The hidden field only a bot fills: do nothing.
    if ((form.elements.namedItem('company') as HTMLInputElement).value) return
    FIELDS.forEach(k => { touched[k] = true })
    const r = validateContact(values())
    if (!r.ok) {
      paint(r.errors)
      const first = FIELDS.find(k => r.errors[k]); if (first) el(first).focus()
      return
    }
    paint({})
    // Open WhatsApp from a real link, clicked inside the visitor's own click.
    // That is the one way out that every context allows: a phone hands it to
    // the app, a desktop opens WhatsApp Web or the desktop app, and pages shown
    // inside a sandboxed frame (such as a preview) let a link through where
    // they block a redirect or window.open.
    const url = whatsappUrl(leadText(r.lead))
    // Close the phone keyboard first, so the page is not left zoomed or
    // offset when the visitor comes back from WhatsApp.
    ;(document.activeElement as HTMLElement | null)?.blur()
    const link = document.createElement('a')
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Nothing appears on the page; screen readers hear what happened.
    status.textContent = 'וואטסאפ נפתח עם הפרטים. נשאר ללחוץ שליחה בוואטסאפ.'
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
