import { CTA, site, whatsappUrl } from '@/lib/site'

const FINS = 15

// The opening. Type on the right, the louvre object on the left. Before
// WebGL is ready (or if it never is) a CSS rendition of the same object holds
// the frame, so the first paint already has its centrepiece.
export default function Hero() {
  return (
    <section id="top" className="hero on-dark bg-midnight" data-hero>
      <div className="hero__depth" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="hero__art" aria-hidden="true">
        <div className="hero__fallback">
          {Array.from({ length: FINS }, (_, i) => <i key={i} style={{ ['--i' as string]: i - (FINS - 1) / 2 }} />)}
        </div>
        <canvas className="hero__canvas" data-hero-canvas />
      </div>

      <div className="wrap hero__inner">
        <p className="t-label hero__kicker">סטודיו לעיצוב ובניית אתרים</p>
        <h1 className="t-hero hero__title">
          <span className="line"><span>מותגים דיגיטליים,</span></span>
          <span className="line"><span>בנויים בדיוק.</span></span>
        </h1>
        <p className="t-lede hero__sub">
          אתרי תדמית, דפי נחיתה וזהות חזותית לעסקים שרוצים להיראות ברמה של מה שהם עושים.
        </p>
        <div className="hero__actions">
          <a href="#contact" className="btn btn--light" data-magnetic>{CTA.primary} <span className="btn__arrow" aria-hidden="true">←</span></a>
          <a href="#work" className="btn btn--ghost">{CTA.work}</a>
        </div>
      </div>

      <div className="wrap hero__meta">
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">וואטסאפ <span className="num">{site.phone.display}</span></a>
        <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">אינסטגרם <span className="num">@{site.instagram.handle}</span></a>
      </div>
    </section>
  )
}
