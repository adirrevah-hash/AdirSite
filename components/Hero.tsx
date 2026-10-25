import Split from './Split'
import { CTA, site, whatsappUrl } from '@/lib/site'

// The opening. Type on the right, its second line turning through what the
// sites do; on the left a website in exploded view, its layers floating apart
// as in a design tool. Before WebGL is ready (or if it never is) a CSS
// rendition of the same layers holds the frame.
const WORDS = ['שמוכרים.', 'שבולטים.', 'שמביאים פניות.', 'שעובדים בשבילכם.']
const CHIPS = ['עיצוב מותאם אישית', 'מותאם לכל מסך', 'חיבור לוואטסאפ ולטפסים']

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
          <span className="sr-only">אתרים שמוכרים, בולטים, מביאים פניות ועובדים בשבילכם.</span>
          <span aria-hidden="true">
            <span className="line"><Split text="אתרים" /></span>
            <span className="line hero__rotator" data-rotator>
              {WORDS.map((w, i) => (
                <span key={w} className={`hero__word${i === 0 ? ' is-on' : ''}`}><Split text={w} start={5} /></span>
              ))}
              <i className="hero__underline" data-underline />
            </span>
          </span>
        </h1>
        <p className="t-lede hero__sub">
          אתרי תדמית ודפי נחיתה בעיצוב מוקפד, שהופכים גולשים לפניות, וזהות חזותית שמבדלת אתכם מהמתחרים.
        </p>
        <ul className="hero__chips" aria-label="מה מקבלים">
          {CHIPS.map(c => (
            <li key={c} className="glass"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>{c}</li>
          ))}
        </ul>
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
