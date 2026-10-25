// Contact form rules: what counts as a usable lead, and the WhatsApp message it
// becomes. Pure functions, no dependencies, unit-tested.

export const SERVICE_OPTIONS = [
  { value: 'website', label: 'אתר תדמית' },
  { value: 'landing', label: 'דף נחיתה' },
  { value: 'logo', label: 'לוגו וזהות חזותית' },
  { value: 'card', label: 'כרטיס ביקור' },
  { value: 'digital', label: 'טפסים, וואטסאפ ואינטגרציות' },
  { value: 'hosting', label: 'אחסון וניהול' },
  { value: 'other', label: 'משהו אחר / עוד לא בטוח' },
] as const

export type ServiceValue = (typeof SERVICE_OPTIONS)[number]['value']

export type ContactInput = {
  name: string
  phone: string
  service: string
  message: string
  consent: boolean // agreed to the privacy policy and the terms of use
}

export type Lead = {
  name: string
  phone: string // normalised, digits only, local format (05XXXXXXXX)
  service: ServiceValue
  serviceLabel: string
  message: string
}

export type FieldErrors = Partial<Record<keyof ContactInput, string>>

export const LIMITS = { name: 80, message: 1000 }

// Israeli numbers: mobile 05X, landlines 02/03/04/08/09, VoIP 07X.
// Accepts spaces, dashes, brackets and a +972 / 972 prefix.
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/[\s\-().]/g, '')
  if (d.startsWith('+972')) d = '0' + d.slice(4)
  else if (d.startsWith('972')) d = '0' + d.slice(3)
  if (!/^\d+$/.test(d)) return null
  if (/^05\d{8}$/.test(d)) return d
  if (/^07\d{8}$/.test(d)) return d
  if (/^0[23489]\d{7}$/.test(d)) return d
  return null
}

const clean = (s: unknown) =>
  typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : ''

export function validateContact(input: Partial<Record<keyof ContactInput, unknown>>):
  | { ok: true; lead: Lead }
  | { ok: false; errors: FieldErrors } {
  const name = clean(input.name).replace(/\s+/g, ' ')
  const phoneRaw = clean(input.phone)
  const service = clean(input.service)
  const message = clean(input.message)
  const errors: FieldErrors = {}

  if (name.length < 2) errors.name = 'נא לכתוב שם (לפחות 2 תווים).'
  else if (name.length > LIMITS.name) errors.name = `השם ארוך מדי (עד ${LIMITS.name} תווים).`

  const phone = normalisePhone(phoneRaw)
  if (!phoneRaw) errors.phone = 'נא לכתוב מספר טלפון.'
  else if (!phone) errors.phone = 'המספר לא נראה תקין. לדוגמה: 050-1234567'

  const option = SERVICE_OPTIONS.find(o => o.value === service)
  if (!option) errors.service = 'נא לבחור סוג שירות.'

  if (message.length > LIMITS.message) errors.message = `התיאור ארוך מדי (עד ${LIMITS.message} תווים).`

  if (input.consent !== true) errors.consent = 'יש לאשר את מדיניות הפרטיות ואת תנאי השימוש.'

  if (Object.keys(errors).length || !phone || !option) return { ok: false, errors }
  return { ok: true, lead: { name, phone, service: option.value, serviceLabel: option.label, message } }
}

export function formatPhone(local: string) {
  return local.length === 10 ? `${local.slice(0, 3)}-${local.slice(3)}` : local.length === 9 ? `${local.slice(0, 2)}-${local.slice(2)}` : local
}

// The text a lead arrives as on WhatsApp.
export function leadText(lead: Lead) {
  const lines = [
    'היי ARStudio, השארתי פרטים באתר:',
    `שם: ${lead.name}`,
    `טלפון: ${formatPhone(lead.phone)}`,
    `שירות: ${lead.serviceLabel}`,
  ]
  if (lead.message) lines.push(`פרטים: ${lead.message}`)
  return lines.join('\n')
}
