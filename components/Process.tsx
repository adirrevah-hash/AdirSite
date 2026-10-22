import { processSteps as steps, services } from '@/lib/site'
import ProcessMotion from './ProcessMotion'

// The signature moment. While the section is pinned, scrolling builds a
// website in front of the visitor, in the same four steps the studio works in:
// a frame, a wireframe, colour and type, then a live address. It is a drawing,
// labelled as one, not a screenshot of a real project.
export default function Process() {
  const cols = services.slice(0, 3).map(s => s.title)
  return (
    <section id="process" className="process" data-tone="paper" data-sc-act="pin" data-sc-span="3.6" style={{ height: '360vh' }} aria-labelledby="process-title">
      <div data-sc-stage data-sc-verify-state="">
        <div className="wrap process__grid">
          <div>
            <h2 id="process-title" className="display display-lg m-0">ככה נבנה אתר.</h2>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.id} className={`step${i === 0 ? ' is-active' : ''}`} data-step={i}>
                  <span className="step__dot" aria-hidden="true" />
                  <span className="step__title">{s.title}</span>
                  <p className="step__line">{s.line}</p>
                </li>
              ))}
            </ol>
          </div>

          <figure className="m-0">
            <svg className="build" viewBox="0 0 1200 760" role="img" aria-label="איור: אתר נבנה שלב אחרי שלב, מקו מתאר ועד אתר באוויר" style={{ direction: 'ltr' }}>
              <g className="build__frame">
                {/* step 2+: surfaces */}
                <rect className="fill" data-at="0" x="10" y="64" width="1180" height="686" fill="#F6F4EF" />
                <rect className="fill" data-at="1" x="40" y="140" width="1120" height="330" rx="6" fill="#2230D6" />
                <circle className="fill" data-at="2" cx="280" cy="305" r="112" fill="#F1EEE6" />
                <rect className="fill" data-at="3" x="880" y="352" width="230" height="58" rx="29" fill="#F1EEE6" />
                <rect className="fill" data-at="4" x="40" y="510" width="353" height="210" rx="6" fill="#E2DED5" />
                <rect className="fill" data-at="5" x="423" y="510" width="354" height="210" rx="6" fill="#E2DED5" />
                <rect className="fill" data-at="6" x="807" y="510" width="353" height="210" rx="6" fill="#E2DED5" />

                {/* step 1: the frame */}
                <rect className="ln" data-d="0" x="10" y="10" width="1180" height="740" rx="18" pathLength={1} />
                <path className="ln" data-d="0" d="M10 64h1180" pathLength={1} />
                <circle className="ln" data-d="0" cx="44" cy="37" r="7" pathLength={1} />
                <circle className="ln" data-d="0" cx="70" cy="37" r="7" pathLength={1} />
                <circle className="ln" data-d="0" cx="96" cy="37" r="7" pathLength={1} />
                <rect className="ln" data-d="0" x="420" y="23" width="360" height="28" rx="14" pathLength={1} />

                {/* step 2: the wireframe */}
                <rect className="ln bar" data-d="1" x="1040" y="88" width="120" height="24" rx="4" pathLength={1} />
                <path className="ln bar" data-d="1" d="M700 100h70M800 100h70M900 100h70" pathLength={1} />
                <rect className="ln" data-d="1" x="40" y="140" width="1120" height="330" rx="6" pathLength={1} />
                <path className="ln bar" data-d="1" d="M1110 220H620M1110 285H700" pathLength={1} />
                <rect className="ln" data-d="1" x="880" y="352" width="230" height="58" rx="29" pathLength={1} />
                <circle className="ln" data-d="1" cx="280" cy="305" r="112" pathLength={1} />
                <rect className="ln" data-d="1" x="40" y="510" width="353" height="210" rx="6" pathLength={1} />
                <rect className="ln" data-d="1" x="423" y="510" width="354" height="210" rx="6" pathLength={1} />
                <rect className="ln" data-d="1" x="807" y="510" width="353" height="210" rx="6" pathLength={1} />
                <path className="ln bar" data-d="1" d="M360 560H80M743 560H463M1126 560H847" pathLength={1} />

                {/* step 3: real type replaces the bars */}
                <g className="txt" fill="#13151C" textAnchor="end">
                  <text x="1158" y="108" fontSize="26" fontWeight="900" style={{ fontStretch: '75%' }}>העסק שלכם</text>
                  <text x="970" y="108" fontSize="20" fontFamily="var(--font-text)">שירותים</text>
                  <text x="870" y="108" fontSize="20" fontFamily="var(--font-text)">עבודות</text>
                  <text x="770" y="108" fontSize="20" fontFamily="var(--font-text)">צור קשר</text>
                  <text x="1110" y="238" fontSize="66" fontWeight="900" fill="#F1EEE6" style={{ fontStretch: '75%' }}>העסק שלכם,</text>
                  <text x="1110" y="310" fontSize="66" fontWeight="900" fill="#F1EEE6" style={{ fontStretch: '75%' }}>במקום הראשון.</text>
                  <text x="1062" y="389" fontSize="22" fontWeight="600" fill="#0F145C" fontFamily="var(--font-text)">בואו נדבר</text>
                  {cols.map((c, i) => (
                    <text key={c} x={[360, 743, 1126][i]} y="572" fontSize="30" fontWeight="900" style={{ fontStretch: '80%' }}>{c}</text>
                  ))}
                </g>

                {/* step 4: an address, and it is live */}
                <g className="live">
                  <text x="600" y="43" fontSize="16" textAnchor="middle" fill="#4A4D5C" fontFamily="var(--font-text)">your-business.co.il</text>
                  <circle cx="1112" cy="37" r="6" fill="#2230D6" />
                  <text x="1100" y="43" fontSize="16" textAnchor="end" fill="#13151C" fontFamily="var(--font-text)">באוויר</text>
                </g>
              </g>
            </svg>
            <figcaption className="sr-only">איור של תהליך העבודה</figcaption>
          </figure>
        </div>
      </div>
      <ProcessMotion />
    </section>
  )
}
