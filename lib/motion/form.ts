import { validateContact, leadText, type ContactInput, type FieldErrors } from '../contact'
import { whatsappUrl } from '../site'

const FIELDS: (keyof ContactInput)[] = ['name', 'phone', 'service', 'message', 'consent']

// The lead form. Validates in the browser, then opens WhatsApp to the studio's
// number with everything the visitor wrote already in the message.
//
// The send button is a real link to WhatsApp whose address follows what the
// visitor types. A tap on a real link is the one way out that every context
// lets through: a phone hands it to the WhatsApp app, a desktop opens WhatsApp
// Web or the desktop app, and a page shown inside a frame (such as a preview)
// lets it out where it refuses script-opened windows and redirects. The tap
// is stopped only while the form still needs fixing. WhatsApp
// still needs the visitor to press send; the page never claims a message was
// sent, and tells screen readers that WhatsApp opened.
export function initForm() {
  const found = document.querySelector<HTMLFormElement>('[data-lead-form]')
  if (!found) return () => {}
  const form: HTMLFormElement = found
  const status = form.querySelector<HTMLElement>('[data-status]')!
  const send = form.querySelector<HTMLAnchorElement>('[data-submit]')!
  const touched: Partial<Record<keyof ContactInput, boolean>> = {}

  const el = (k: keyof ContactInput) => form.elements.namedItem(k) as HTMLInputElement
  const values = (): ContactInput => ({ name: el('name').value, phone: el('phone').value, service: el('service').value, message: el('message').value, consent: el('consent').checked })

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
    refresh()
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

  // Keep the link's address in step with the form.
  function refresh() {
    const r = validateContact(values())
    send.href = whatsappUrl(r.ok ? leadText(r.lead) : undefined)
  }

  function onSend(e: MouseEvent) {
    // The hidden field only a bot fills: do nothing.
    if ((form.elements.namedItem('company') as HTMLInputElement).value) { e.preventDefault(); return }
    FIELDS.forEach(k => { touched[k] = true })
    const r = validateContact(values())
    if (!r.ok) {
      e.preventDefault()
      paint(r.errors)
      const first = FIELDS.find(k => r.errors[k]); if (first) el(first).focus()
      return
    }
    paint({})
    send.href = whatsappUrl(leadText(r.lead))
    // Close the phone keyboard first, so the page is not left zoomed or
    // offset when the visitor comes back from WhatsApp.
    ;(document.activeElement as HTMLElement | null)?.blur()
    // Nothing appears on the page; screen readers hear what happened.
    status.textContent = 'וואטסאפ נפתח עם הפרטים. נשאר ללחוץ שליחה בוואטסאפ.'
  }

  // Enter in a field sends, as it would with a submit button.
  function onSubmit(e: SubmitEvent) { e.preventDefault(); send.click() }
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (e.key === 'Enter' && t.matches('input:not([type=checkbox])')) { e.preventDefault(); send.click() }
  }

  // "לבקש הצעה" on a service card preselects that service.
  const onPreselect = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLElement>('[data-service]')
    if (a?.dataset.service) { el('service').value = a.dataset.service; refresh() }
  }

  form.addEventListener('input', onInput)
  form.addEventListener('change', onInput) // checkboxes, in browsers that send no input event
  form.addEventListener('focusout', onBlur)
  form.addEventListener('submit', onSubmit)
  form.addEventListener('keydown', onKey)
  send.addEventListener('click', onSend)
  refresh()
  document.addEventListener('click', onPreselect)
  return () => {
    form.removeEventListener('input', onInput)
    form.removeEventListener('change', onInput)
    form.removeEventListener('focusout', onBlur)
    form.removeEventListener('submit', onSubmit)
    form.removeEventListener('keydown', onKey)
    send.removeEventListener('click', onSend)
    document.removeEventListener('click', onPreselect)
  }
}
