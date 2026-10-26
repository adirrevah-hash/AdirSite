// Every business fact on the site lives here. Nothing is invented: where a
// detail has not been supplied (email, domain, Facebook, project write-ups)
// the field is empty and the page leaves it out or marks it as pending.

export const site = {
  name: 'ARStudio',
  description:
    'ARStudio בונה אתרי תדמית, דפי נחיתה וזהות חזותית לעסקים, יזמים ומותגים שרוצים נוכחות דיגיטלית ברמה של מה שהם עושים.',
  // The domain, once set (NEXT_PUBLIC_SITE_URL). Until then, on Vercel, the
  // project's production address, which becomes the custom domain when one
  // is connected. Used on the server only: canonical, sitemap, share image.
  url: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : ''),
  phone: { display: '053-800-7008', tel: '+972538007008', whatsapp: '972538007008' },
  instagram: { handle: 'ar_studio1', url: 'https://www.instagram.com/ar_studio1/' },
  email: '', // not supplied yet
  facebook: '', // not supplied yet
} as const

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${site.phone.whatsapp}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export const CTA = { primary: 'בואו נדבר', work: 'לעבודות' }

export const nav = [
  { href: '#work', label: 'עבודות' },
  { href: '#about', label: 'אודות' },
  { href: '#services', label: 'שירותים' },
  { href: '#process', label: 'תהליך' },
  { href: '#contact', label: 'צור קשר' },
]

export type ServiceId = 'websites' | 'landing' | 'identity' | 'cards' | 'digital' | 'hosting'

export type Service = { id: ServiceId; title: string; text: string; value: string; formValue: string }

// Draft copy for the studio to confirm. Each line says what the work is, not
// what it guarantees.
export const services: Service[] = [
  {
    id: 'websites',
    title: 'אתרי תדמית',
    text: 'אתר שמציג את העסק כמו שהוא באמת: מבנה עמודים ברור, עיצוב בהתאמה אישית ותוכן שמוביל לפנייה.',
    value: 'הרושם הראשון של הלקוח, בכל מסך.',
    formValue: 'website',
  },
  {
    id: 'landing',
    title: 'דפי נחיתה',
    text: 'עמוד אחד, מטרה אחת. מסר חד, מבנה שמוביל לפעולה וטופס שמגיע אליכם.',
    value: 'נבנה לקמפיין, למבצע או להשקה.',
    formValue: 'landing',
  },
  {
    id: 'identity',
    title: 'לוגו וזהות חזותית',
    text: 'סימן, צבעים וטיפוגרפיה שעובדים יחד, משלט החנות ועד האייקון בטלפון.',
    value: 'בסיס אחד לכל מה שהמותג מוציא החוצה.',
    formValue: 'logo',
  },
  {
    id: 'cards',
    title: 'כרטיסי ביקור',
    text: 'כרטיס שממשיך את שפת המותג, מעוצב בשני הצדדים ומוכן לבית הדפוס.',
    value: 'החלק הפיזי של הזהות, באותה רמה.',
    formValue: 'card',
  },
  {
    id: 'digital',
    title: 'פתרונות דיגיטליים',
    text: 'טפסי לידים, חיבור לוואטסאפ ואינטגרציות שמעבירות כל פנייה למקום הנכון.',
    value: 'פחות פניות שנופלות בין הכיסאות.',
    formValue: 'digital',
  },
  {
    id: 'hosting',
    title: 'אחסון וניהול',
    text: 'דומיין, אחסון ועדכוני תוכן במקום אחד, לפי חבילה שמותאמת לעסק.',
    value: 'אתר שממשיך לעבוד גם אחרי ההשקה.',
    formValue: 'hosting',
  },
]

export const processSteps = [
  { id: 'brief', title: 'אפיון', text: 'שיחה על העסק, הקהל והמטרה. יוצאים עם מבנה עמודים ותוכן.', out: 'מבנה האתר' },
  { id: 'design', title: 'קונספט ועיצוב', text: 'כיוון חזותי ומסכי מפתח לדסקטופ ולמובייל, עם סבב תיקונים.', out: 'עיצוב מאושר' },
  { id: 'build', title: 'פיתוח', text: 'בניית האתר, חיבור הטפסים והוואטסאפ, והתאמה לכל רוחב מסך.', out: 'אתר עובד' },
  { id: 'launch', title: 'בדיקות והשקה', text: 'בדיקה בכל רוחב מסך ובדפדפנים המרכזיים, ועלייה לאוויר.', out: 'אתר באוויר' },
] as const

// Portfolio. Screenshots are picked up from /public/work/<id>-desktop.jpg and
// <id>-mobile.jpg (npm run capture:work). The write-ups come from the studio;
// a field it has not supplied shows as pending on the page.
export type Project = {
  id: string
  name: string
  url: string
  kind: string // what was built, as the studio describes it
  goal?: string
  delivered?: string[]
  result?: string // as reported by the studio
}

// What the studio delivered on every project, and the result it reports.
const delivered = ['אתר מלא', 'מותאם למובייל', 'חיבור לוואטסאפ']
const result = 'החיבור לוואטסאפ הביא לאחוזי המרה גבוהים.'

export const projects: Project[] = [
  {
    id: 'wiserise', name: 'WiseRise', url: 'https://www.wiserise.co.il/', kind: 'אתר',
    goal: 'אתר ליועץ משכנתאות שמסביר בפשטות למה כדאי לבדוק משכנתא עם יועץ, בונה אמון מהמבט הראשון, ומוביל את הגולש לתאם שיחת ייעוץ ראשונה בטופס או בטלפון.',
    delivered, result,
  },
  {
    id: 'alumina', name: 'Alumina Group', url: 'https://www.alumina-group.co.il/', kind: 'אתר',
    goal: 'אתר לחברת פרגולות, סוככי מסך, סוככי זרועות ופתרונות הצללה, שמציג את המוצרים והפרויקטים ברמה שמתאימה למוצר יוקרתי, ומוביל לתיאום פגישת ייעוץ.',
    delivered, result,
  },
  {
    id: 'readytogoo', name: 'ReadyToGo', url: 'https://readytogoo.com/', kind: 'אתר',
    goal: 'אתר לסוכנות שיווק דיגיטלי שמציגה בבירור את השירותים שלה: קמפיינים, בניית אתרים, ניהול סושיאל ועוד, ומובילה לתיאום שיחת אפיון.',
    delivered, result,
  },
]
