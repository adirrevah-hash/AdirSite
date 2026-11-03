import { packages, carePlans, shekels } from '@/lib/pricing'

// The way from the home page to /pricing: the three packages and their
// prices at a glance, the monthly care from its lowest price, and one clear
// button to the full page. The figures come from lib/pricing, like the page.
export default function PlansTeaser() {
  const careFrom = Math.min(...carePlans.map(p => p.price))
  return (
    <section id="plans" className="plans-teaser on-dark" aria-labelledby="plans-title">
      <div className="wrap">
        <div className="plans-teaser__panel">
          <div className="plans-teaser__copy">
            <p className="t-label">המסלולים שלנו</p>
            <h2 id="plans-title" className="plans-teaser__title">בחרו את המסלול שמתאים לעסק שלכם</h2>
            <p className="plans-teaser__text">שלוש חבילות להקמת אתר ושני מסלולי תחזוקה חודשיים, עם כל מה שכלול בכל אחד.</p>
          </div>
          <div className="plans-teaser__side">
            <ul className="plans-teaser__rail" aria-label="מחירי החבילות">
              {packages.map(p => (
                <li key={p.id} className={p.featured ? 'is-featured' : undefined}>
                  <span className="plans-teaser__code" dir="ltr">{p.code}</span>
                  <span className="plans-teaser__name">{p.name}</span>
                  <span className="plans-teaser__price"><span className="num">{shekels(p.price)}</span> ₪</span>
                </li>
              ))}
            </ul>
            <div className="plans-teaser__foot">
              <p className="plans-teaser__care">תחזוקה חודשית החל מ־<span className="num">{careFrom}</span> ₪ לחודש</p>
              <a href="/pricing" className="btn btn--light plans-teaser__cta" data-magnetic>לכל המסלולים והמחירים <span className="btn__arrow" aria-hidden="true">←</span></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
