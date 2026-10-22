import { processSteps as steps, services } from '@/lib/site'
import ProcessMotion from './ProcessMotion'

// The signature moment. A laptop arrives closed and opens as the section
// pins; on its screen a website is built in the studio's four steps: the lid
// opens (the conversation), a wireframe draws (the sketch), colour spreads out
// of a circle and the page scrolls (design and build), then the address types
// itself and a cursor presses the button (launch). It is an illustration made
// of real markup, labelled as one, not a screenshot of a project.

const cards = services.slice(0, 3).map(s => s.title)

function Screen() {
  return (
    <div className="scr">
      <div className="scr__on">
        <div className="scr__bar">
          <span className="scr__dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="scr__url" dir="ltr"><span className="scr__typed">your-business.co.il</span><span className="scr__caret" /></span>
          <span className="scr__live"><b />באוויר</span>
        </div>
        <div className="scr__page">
          <svg className="scr__wire" viewBox="0 0 1000 605" aria-hidden="true">
            <rect x="850" y="22" width="110" height="24" rx="4" pathLength={1} />
            <path d="M770 34h-60M680 34h-60M590 34h-60" pathLength={1} />
            <rect x="40" y="70" width="920" height="270" rx="10" pathLength={1} />
            <path d="M920 140H560M920 186H620" pathLength={1} />
            <rect x="760" y="234" width="160" height="40" rx="20" pathLength={1} />
            <circle cx="230" cy="205" r="95" pathLength={1} />
            <rect x="670" y="372" width="290" height="200" rx="8" pathLength={1} />
            <rect x="355" y="372" width="290" height="200" rx="8" pathLength={1} />
            <rect x="40" y="372" width="290" height="200" rx="8" pathLength={1} />
            <path d="M930 410H760M615 410H445M300 410H130" pathLength={1} />
          </svg>
          <div className="scr__site">
            <div className="ms">
              <div className="ms__nav"><b>העסק שלכם</b><span>שירותים</span><span>עבודות</span><span>צור קשר</span></div>
              <div className="ms__hero">
                <p className="ms__h">העסק שלכם,<br />במקום הראשון.</p>
                <p className="ms__p">אתר שמסביר מי אתם ומביא פניות.</p>
                <span className="ms__cta">בואו נדבר</span>
                <span className="ms__orb" />
              </div>
              {cards.map((c, i) => (
                <div key={c} className={`ms__card ms__card--${i}`}><b>{c}</b><i /><i /></div>
              ))}
              <div className="ms__band"><b>ARStudio</b><span>אתרים שנבנים בכוונה</span></div>
            </div>
          </div>
          <span className="scr__ripple" />
          <svg className="scr__cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l13 7.5-6 1.6-3 5.9z" /></svg>
        </div>
      </div>
      <span className="scr__glare" />
    </div>
  )
}

export default function Process() {
  return (
    <section id="process" className="process" data-tone="paper" data-sc-act="pin" data-sc-span="4" style={{ height: '400vh' }} aria-labelledby="process-title">
      <div data-sc-stage data-sc-verify-state="">
        <div className="wrap process__grid">
          <div className="pcopy">
            <h2 id="process-title" className="display pcopy__title m-0">ככה נבנה אתר<span className="gold">.</span></h2>
            <ol className="psteps">
              {steps.map((s, i) => (
                <li key={s.id} className={`pstep${i === 0 ? ' is-active' : ''}`} data-step={i}>
                  <span className="pstep__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="pstep__title display m-0">{s.title}</h3>
                  <p className="pstep__line">{s.line}</p>
                </li>
              ))}
            </ol>
            <div className="prail" aria-hidden="true">
              <div className="prail__track"><span className="prail__fill" /></div>
              <ul className="prail__labels">
                {steps.map((s, i) => <li key={s.id} className={i === 0 ? 'is-active' : ''}>{s.title}</li>)}
              </ul>
            </div>
          </div>

          <figure className="mac-wrap m-0" role="img" aria-label="איור: לפטופ נפתח ועל המסך שלו נבנה אתר, משרטוט ועד אתר באוויר">
            <div className="mac">
              <div className="mac__lid">
                <div className="mac__back"><span /></div>
                <div className="mac__front"><Screen /></div>
              </div>
              <div className="mac__body"><div className="mac__deck"><span className="mac__keys" /><span className="mac__pad" /></div></div>
            </div>
          </figure>
        </div>
      </div>
      <ProcessMotion />
    </section>
  )
}
