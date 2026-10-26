import Split from './Split'
import { CTA } from '@/lib/site'

// The opening, after the studio's reference: the studio's own desk scene (a
// laptop, phone, business cards and pen on dark marble) on one side, the
// statement on the other. Phones stack the statement over the scene and close
// on a short signature line.
const SERVICES = ['עיצוב', 'פיתוח', 'מיתוג', 'שיווק דיגיטלי']

export default function Hero() {
  return (
    <section id="top" className="hero on-dark bg-midnight" data-hero>
      <div className="hero__depth" aria-hidden="true" />

      <div className="hero__art" aria-hidden="true" data-hero-art>
        <picture>
          <source media="(max-width: 959px)" srcSet="/hero/scene-mobile.jpg" width={940} height={778} />
          <img src="/hero/scene-desktop.jpg" width={950} height={831} alt="" fetchPriority="high" decoding="async" className="hero__scene" />
        </picture>
      </div>

      <div className="wrap hero__inner">
        <p className="hero__kicker" dir="ltr">Digital solutions for your business</p>
        <h1 className="hero__title">
          <span className="line hero__line1"><Split text="נוכחות דיגיטלית" /></span>
          <span className="line hero__line2"><Split text="שמביאה תוצאות" start={14} /></span>
        </h1>
        <p className="hero__sub">
          אתרים מקצועיים, לוגואים מרשימים, כרטיסי ביקור וכל מה שהעסק שלך צריך כדי לבלוט ולהצליח.
        </p>
        <span className="hero__rule" aria-hidden="true" />
        <ul className="hero__services" aria-label="מה עושים בסטודיו">
          {SERVICES.map(s => <li key={s}>{s}</li>)}
        </ul>
        <div className="hero__actions">
          <a href="#contact" className="btn btn--light" data-magnetic>{CTA.primary} <span className="btn__arrow" aria-hidden="true">←</span></a>
          <a href="#work" className="btn btn--ghost">{CTA.work}</a>
        </div>
      </div>

      <p className="hero__sign" dir="ltr" aria-hidden="true"><i />Your vision<br />our design</p>
    </section>
  )
}
