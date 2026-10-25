import Split from './Split'

// Behind the studio: a short introduction from the founder, a hand-drawn
// signature and one call to action. Gold is kept to accents: the label, the
// signature and the button rim.

// "ADIR", hand-lettered as single strokes, so it stays sharp at any size.
function Signature() {
  return (
    <svg className="about__signature" viewBox="0 0 290 112" role="img" aria-label="חתימה: אדיר, ARStudio">
      {/* slanted like a pen hand; the R's tail sweeps back under the name */}
      <g className="about__sig-ink" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(20 0) skewX(-14)">
        <path d="M16 84 C 28 60, 44 30, 62 8 C 63 32, 66 58, 74 82" />
        <path d="M4 60 C 44 50, 104 42, 168 44" />
        <path d="M92 14 C 94 38, 94 60, 90 82" />
        <path d="M88 16 C 128 6, 150 40, 128 66 C 118 78, 102 82, 86 83" />
        <path d="M162 14 C 161 38, 159 60, 156 82" />
        <path d="M180 82 C 182 58, 184 34, 186 12 C 216 2, 230 30, 198 42 C 214 54, 232 72, 266 84" />
        <path className="about__sig-flourish" d="M266 84 C 214 99, 128 104, 46 96" />
      </g>
      <text x="282" y="110" textAnchor="end" className="about__sig-sub">AR Studio</text>
    </svg>
  )
}

export default function About() {
  return (
    <section id="about" className="about on-dark" aria-labelledby="about-title">
      <div className="about__deco" aria-hidden="true"><i className="about__arc" /><i className="about__rule" /></div>
      <div className="wrap about__grid">
        <div className="about__copy" data-reveal="fade">
          <p className="t-label about__label">מאחורי ARStudio</p>
          <h2 id="about-title" className="t-h2 about__title">
            <span className="line"><Split text="נעים להכיר," /></span>
            <span className="line"><Split text="אני אדיר." start={10} /></span>
          </h2>
          <p className="about__text">אני מעצב ובונה אתרים ודפי נחיתה לעסקים שרוצים להיראות אחרת, לחדד את המסר שלהם ולהפוך נוכחות דיגיטלית לכלי שמייצר הזדמנויות.</p>
          <p className="about__motto">עיצוב מדויק. חוויית משתמש חכמה. תשומת לב לכל פרט.</p>
          <Signature />
          <a href="#contact" className="about__cta">בואו נדבר על הפרויקט שלכם <span className="btn__arrow" aria-hidden="true">←</span></a>
        </div>
      </div>
    </section>
  )
}
