import { whatsappUrl } from './site'

// The studio's packages, add-ons and monthly care plans, as the studio
// priced them. Each call to action opens WhatsApp with the plan's name
// already written, so the conversation starts from the right place.

export type Plan = {
  id: string
  code: string // the tier name as the studio writes it, in Latin capitals
  name: string
  price: number
  description?: string
  features: string[]
  featured?: boolean
}

export const packages: Plan[] = [
  {
    id: 'starter', code: 'STARTER', name: 'דף נחיתה מקצועי', price: 2490,
    description: 'הפתרון המושלם לעסק שרוצה נוכחות דיגיטלית ממוקדת ומקצועית.',
    features: [
      'דף נחיתה מעוצב בהתאמה אישית',
      'התאמה מלאה למובייל ולטאבלט',
      'טופס יצירת קשר',
      'כפתור WhatsApp',
      'קישורים לרשתות חברתיות',
      'אנימציות עדינות',
      'חיבור דומיין קיים',
    ],
  },
  {
    id: 'business', code: 'BUSINESS', name: 'אתר תדמית עסקי', price: 4900, featured: true,
    description: 'אתר תדמית מקצועי שמציג את העסק שלך בצורה מרשימה, בונה אמון ומייצר פניות.',
    features: [
      'אתר עד 5 עמודים',
      'עיצוב פרימיום בהתאמה אישית למותג',
      'התאמה מלאה לכל המכשירים',
      'טפסי לידים וחיבור WhatsApp',
      'גלריית תמונות ופרויקטים',
      'אנימציות ואפקטים מתקדמים',
      'SEO טכני בסיסי',
      'חיבור דומיין',
      'הדרכה קצרה על האתר',
    ],
  },
  {
    id: 'premium', code: 'PREMIUM', name: 'חוויית מותג דיגיטלית', price: 6900,
    description: 'פתרון דיגיטלי מקיף לעסקים שרוצים לבלוט עם נראות ייחודית ומיתוג מקצועי.',
    features: [
      'אתר עד 8 עמודים',
      'אפיון ועיצוב אישי ברמה גבוהה',
      'לוגו עסקי בסיסי',
      'כרטיס ביקור דיגיטלי או מעוצב',
      'גלריות וקרוסלות מתקדמות',
      'אנימציות ואינטראקציות',
      'טפסי לידים וחיבור WhatsApp',
      'SEO טכני בסיסי',
      'חיבור דומיין',
      'ליווי עד העלייה לאוויר',
    ],
  },
]

export type AddOn = { id: string; name: string; from: number }

export const addOns: AddOn[] = [
  { id: 'logo', name: 'עיצוב לוגו בסיסי', from: 750 },
  { id: 'card', name: 'עיצוב כרטיס ביקור', from: 250 },
  { id: 'page', name: 'עמוד נוסף לאתר', from: 350 },
  { id: 'landing', name: 'דף נחיתה נוסף', from: 1200 },
  { id: 'copy', name: 'כתיבה שיווקית מלאה', from: 600 },
  { id: 'social', name: 'פתיחת עמוד עסקי בפייסבוק ובאינסטגרם', from: 400 },
  { id: 'store', name: 'חנות אינטרנטית', from: 8500 },
]

export const carePlans: Plan[] = [
  {
    id: 'care', code: 'CARE', name: 'תחזוקה בסיסית', price: 149,
    features: [
      'אחסון וניהול האתר',
      'גיבויים תקופתיים',
      'בדיקת תקינות האתר',
      'עדכוני תוכן קטנים עד 15 דקות בחודש',
    ],
  },
  {
    id: 'growth', code: 'GROWTH', name: 'ניהול שוטף', price: 249, featured: true,
    features: [
      'כל מה שכלול במסלול CARE',
      'עד 45 דקות שינויים בחודש',
      'החלפת תמונות וטקסטים',
      'בדיקות ביצועים בסיסיות',
      'תמיכה ועדיפות בטיפול בתקלות',
    ],
  },
]

/** 4900 -> "4,900" */
export const shekels = (n: number) => n.toLocaleString('en-US')

export const packageWhatsApp = (p: Plan) => whatsappUrl(`היי, אני מעוניין בחבילת ${p.code} - ${p.name}`)
export const careWhatsApp = (p: Plan) => whatsappUrl(`היי, אני מעוניין להצטרף למסלול ${p.code} - ${p.name}`)
