import Split from './Split'
import { packages, addOns, carePlans, shekels, packageWhatsApp, careWhatsApp, type Plan } from '@/lib/pricing'

// Packages, add-ons and monthly care, in one dark chapter between the
// services and the closing statement. Three packages stand side by side on
// wide screens with BUSINESS raised in the middle; the care plans sit in a
// panel of their own below. Every call to action opens WhatsApp with the
// plan's name written. Readable as plain content; with motion the cards
// rise in as they arrive (the shared "fade" reveal).

function Check() {
  return (
    <svg className="plan__check" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="9" />
      <path d="M6 10.4 8.7 13 14 7.4" />
    </svg>
  )
}

// One line drawing per add-on, on the site's 24px stroke grid.
const ADDON_ICON: Record<string, React.ReactNode> = {
  logo: <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 15.5 12 7.5l3.5 8M9.8 12.8h4.4" /></>,
  card: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M6.5 10h6M6.5 13.5h4" /><circle cx="16.5" cy="11.5" r="1.8" /></>,
  page: <><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4h4M12 11v6M9 14h6" /></>,
  landing: <><rect x="3" y="4.5" width="18" height="15" rx="2" /><path d="M3 8.5h18M7 12.5h10M9 16h6" /></>,
  copy: <><path d="M4 7h16M4 11h16M4 15h10" /><path d="m16.5 19.5 4-4-1.5-1.5-4 4-.5 2z" /></>,
  social: <><circle cx="7" cy="12" r="2.5" /><circle cx="17" cy="6.5" r="2.5" /><circle cx="17" cy="17.5" r="2.5" /><path d="m9.2 10.8 5.6-3.1M9.2 13.2l5.6 3.1" /></>,
  store: <><path d="M5 8.5h14l-1 11.5H6z" /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></>,
}

function PlanCard({ plan, monthly, href, cta, Heading, badge }: {
  plan: Plan; monthly?: boolean; href: string; cta: string; Heading: 'h3' | 'h4'; badge: string
}) {
  return (
    <li className={`plan${plan.featured ? ' plan--featured' : ''}`} data-plan={plan.id}>
      {plan.featured && <p className="plan__badge">{badge}</p>}
      <header className="plan__head">
        <p className="plan__code" dir="ltr">{plan.code}</p>
        <Heading className="plan__name">{plan.name}</Heading>
        {plan.description && <p className="plan__desc">{plan.description}</p>}
      </header>
      <p className="plan__price">
        <span className="plan__amount num">{shekels(plan.price)}</span>
        <span className="plan__cur">₪</span>
        {monthly && <span className="plan__per">לחודש</span>}
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer" className={`btn plan__cta${plan.featured ? ' btn--light' : ''}`}>
        {cta}<span className="sr-only"> {plan.code}</span> <span className="btn__arrow" aria-hidden="true">←</span>
      </a>
      <div className="plan__body">
        <p className="plan__inc">מה כלול</p>
        <ul className="plan__list">
          {plan.features.map(f => <li key={f}><Check /><span>{f}</span></li>)}
        </ul>
      </div>
    </li>
  )
}

export default function Pricing() {
  return (
    <section id="pricing" className="pricing on-dark" aria-labelledby="pricing-title">
      <div className="pricing__glow" aria-hidden="true" />
      <div className="wrap">
        <header className="pricing__head">
          <p className="t-label">המסלולים שלנו</p>
          <h2 id="pricing-title" className="t-h2" data-reveal="chars">
            <span className="line"><Split text="הנוכחות הדיגיטלית שלך" /></span>
            <span className="line"><Split text="מתחילה כאן" start={19} /></span>
          </h2>
          <p className="t-lede">פתרונות דיגיטליים בהתאמה אישית לעסק שלך. מעיצוב מוקפד ועד אתר מקצועי שמייצר הזדמנויות חדשות.</p>
        </header>

        <ul className="plans plans--build" data-reveal="fade" aria-label="חבילות הקמת אתר">
          {packages.map(p => (
            <PlanCard key={p.id} plan={p} href={packageWhatsApp(p)} cta="אני רוצה את החבילה" Heading="h3" badge="הכי מומלצת" />
          ))}
        </ul>

        <div className="addons">
          <h3 className="addons__title">אפשר להוסיף גם</h3>
          <ul className="addons__grid" data-reveal="fade">
            {addOns.map(a => (
              <li key={a.id} className={`addon addon--${a.id}`}>
                <svg className="addon__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ADDON_ICON[a.id]}</svg>
                <span className="addon__name">{a.name}</span>
                <span className="addon__price">החל מ־<span className="num">{shekels(a.from)}</span> ₪</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="care">
          <header className="care__head">
            <p className="t-label">תחזוקה חודשית</p>
            <h3 className="care__title">האתר שלך תמיד בידיים טובות</h3>
            <p className="care__sub">אנחנו דואגים שהאתר שלך יישאר מעודכן, תקין ומוכן להמשיך לעבוד בשביל העסק שלך.</p>
          </header>
          <ul className="plans plans--care" data-reveal="fade" aria-label="מסלולי תחזוקה חודשיים">
            {carePlans.map(p => (
              <PlanCard key={p.id} plan={p} monthly href={careWhatsApp(p)} cta="אני רוצה להצטרף" Heading="h4" badge="מומלץ" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
