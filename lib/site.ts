// Every business fact on the site lives in this file, so it can be reviewed
// and corrected in one place. Nothing here is invented: where a detail has not
// been supplied yet (email, domain) the field is empty and the UI leaves it out.

export const site = {
  name: 'ARStudio',
  description:
    'ARStudio הוא סטודיו לבניית אתרים, דפי נחיתה, עיצוב לוגו וכרטיסי ביקור לעסקים, בעלי מקצוע ויזמים בישראל.',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
  phone: {
    display: '053-800-7008',
    tel: '+972538007008',
    whatsapp: '972538007008',
  },
  instagram: {
    handle: 'ar_studio1',
    url: 'https://www.instagram.com/ar_studio1/',
  },
  email: '', // not supplied yet
} as const

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${site.phone.whatsapp}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export type ServiceId = 'website' | 'landing' | 'logo' | 'card'

export type Service = {
  id: ServiceId
  title: string
  line: string
  includes: string[]
}

// Draft copy for the studio to confirm. Descriptions say what the work is,
// never what it guarantees.
export const services: Service[] = [
  {
    id: 'website',
    title: 'בניית אתרים',
    line: 'אתר לעסק שמסביר מי אתם, מה אתם עושים ולמה לפנות דווקא אליכם.',
    includes: ['מבנה עמודים ומסרים', 'עיצוב בשפת המותג', 'התאמה מלאה לטלפון', 'טפסים ווואטסאפ מחוברים'],
  },
  {
    id: 'landing',
    title: 'דפי נחיתה',
    line: 'עמוד אחד עם מטרה אחת: שהגולש ישאיר פרטים או ייצור קשר.',
    includes: ['מסר אחד וחד', 'מבנה שמוביל לפעולה', 'טופס שמגיע אליכם', 'מוכן לקמפיין'],
  },
  {
    id: 'logo',
    title: 'עיצוב לוגו',
    line: 'סימן שמזהה את העסק ועובד בכל גודל, מהשלט ועד האייקון בטלפון.',
    includes: ['כיוונים לבחירה', 'גרסאות צבע ושחור־לבן', 'קבצים לדפוס ולדיגיטל'],
  },
  {
    id: 'card',
    title: 'כרטיסי ביקור',
    line: 'כרטיס שממשיך את שפת המותג ומוכן לבית הדפוס.',
    includes: ['עיצוב שני צדדים', 'התאמה לשפת המותג', 'קובץ מוכן לדפוס'],
  },
]

// Portfolio. A project is shown ONLY when `verified` is true, meaning the
// studio has confirmed its part in the work and `scope` says exactly what that
// part was. Screenshots go in /public/work (see scripts/capture-work.mjs).
export type Project = {
  id: string
  name: string
  url: string
  verified: boolean
  scope: string // e.g. 'עיצוב ובניית אתר', 'עיצוב בלבד', 'פיתוח בלבד'
  field: string // what the client does, in a few words
  image?: { desktop: string; mobile?: string; alt: string }
}

export const projects: Project[] = [
  { id: 'wiserise', name: 'WiseRise', url: 'https://www.wiserise.co.il/', verified: false, scope: '', field: '' },
  { id: 'alumina', name: 'Alumina Group', url: 'https://www.alumina-group.co.il/', verified: false, scope: '', field: '' },
  { id: 'readytogoo', name: 'Ready to Goo', url: 'https://readytogoo.com/', verified: false, scope: '', field: '' },
]

export const shownProjects = projects.filter(p => p.verified && p.scope && p.image)

export const processSteps = [
  { id: 'talk', title: 'שיחה', line: 'מבינים את העסק, את הקהל ואת המטרה של האתר.' },
  { id: 'sketch', title: 'סקיצה', line: 'מבנה העמודים והמסרים, לפני צבע וגופן.' },
  { id: 'build', title: 'עיצוב ופיתוח', line: 'השפה החזותית נבנית ומפותחת לאתר עובד.' },
  { id: 'launch', title: 'עלייה לאוויר', line: 'בדיקות בטלפון ובמחשב, חיבור הטפסים ועלייה לאוויר.' },
] as const

export const nav = [
  { href: '#services', label: 'שירותים' },
  ...(shownProjects.length ? [{ href: '#work', label: 'עבודות' }] : []),
  { href: '#process', label: 'תהליך' },
  { href: '#contact', label: 'צור קשר' },
]

export const CTA_LABEL = 'בואו נדבר'
