import Split from './Split'
import { CTA, site, whatsappUrl } from '@/lib/site'

// The opening. Type on the right; on the left a website in exploded view,
// its layers floating apart as in a design tool. Before WebGL is ready (or if
// it never is) a CSS rendition of the same layers holds the frame, so the
// first paint already has its centrepiece.
export default function Hero() {
  return (
    <section id="top" className="hero on-dark bg-midnight" data-hero>
      <div className="hero__depth" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="hero__art" aria-hidden="true">
        <div className="hero__fallback">
          <div className="hl">
            <i className="hl__base" /><i className="hl__bar" /><i className="hl__img" />
            <i className="hl__h1" /><i className="hl__h2" /><i className="hl__btn" />
            <i className="hl__card hl__card--1" /><i className="hl__card hl__card--2" /><i className="hl__card hl__card--3" />
          </div>
        </div>
        <canvas className="hero__canvas" data-hero-canvas />
      </div>

      <div className="wrap hero__inner">
        <p className="t-label hero__kicker">סטודיו לעיצוב ובניית אתרים</p>
        <h1 className="t-hero hero__title">
          <span className="line"><Split text="מותגים דיגיטליים," /></span>
          <span className="line"><Split text="בנויים בדיוק." start={16} /></span>
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
