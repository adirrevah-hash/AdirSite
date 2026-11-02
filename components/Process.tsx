import Split from './Split'
import { processSteps } from '@/lib/site'

// The process as a journey: each step pairs a glass card with a round
// medallion, alternating sides, and a gold line runs from medallion to
// medallion. Readable as plain content; with motion the line draws as the
// section is read and each step lights when the line reaches it
// (lib/motion/process.ts draws the line between the medallions it finds).

// One drawing per step, in the medallion: direction, design, build, launch.
const ART: Record<string, React.ReactNode> = {
  brief: (
    <>
      <path d="M14 88 L66 72 L108 86 L56 104 Z" fill="#101D30" stroke="rgb(197 205 216 / .28)" strokeWidth=".8" />
      <path d="M27 84 L79 98 M40 80 L92 94 M53 76 L101 89 M36 91 L88 75 M24 87 L76 71" stroke="rgb(157 184 227 / .22)" strokeWidth=".6" />
      <circle cx="60" cy="54" r="31" fill="url(#pr-gold)" />
      <circle cx="60" cy="54" r="26.5" fill="#0B1628" stroke="rgb(245 246 248 / .18)" strokeWidth=".8" />
      <g stroke="#C9A779" strokeWidth="1.1" strokeLinecap="round">
        <path d="M60 30.5v3.5M60 74v3.5M36.5 54h3.5M80 54h3.5M43.4 37.4l2 2M74.6 68.6l2 2M43.4 70.6l2-2M74.6 39.4l2-2" />
      </g>
      <path d="M60 33 L64.5 54 L60 75 L55.5 54 Z" fill="url(#pr-silver)" />
      <path d="M60 33 L64.5 54 L55.5 54 Z" fill="url(#pr-gold)" />
      <path d="M38 54 L60 50.5 L82 54 L60 57.5 Z" fill="url(#pr-gold)" opacity=".75" />
      <circle cx="60" cy="54" r="2.6" fill="#F5F6F8" />
      <circle cx="60" cy="19" r="4.2" fill="none" stroke="url(#pr-gold)" strokeWidth="2" />
      <rect x="56.5" y="21.5" width="7" height="3.5" rx="1" fill="url(#pr-gold)" />
    </>
  ),
  design: (
    <>
      <rect x="14" y="26" width="80" height="60" rx="6" fill="#0B1628" stroke="url(#pr-silver)" strokeWidth="1.4" />
      <path d="M14 36h80" stroke="rgb(197 205 216 / .25)" strokeWidth=".8" />
      <circle cx="21" cy="31" r="1.6" fill="#8E9AAA" /><circle cx="26.5" cy="31" r="1.6" fill="#8E9AAA" /><circle cx="32" cy="31" r="1.6" fill="#8E9AAA" />
      <text x="21" y="62" fontSize="20" fontWeight="500" fill="#F5F6F8" style={{ fontFamily: 'var(--font-display)' }} direction="ltr">Aa</text>
      <rect x="52" y="42" width="34" height="24" rx="2.5" fill="#172B43" stroke="rgb(157 184 227 / .5)" strokeWidth=".8" />
      <path d="M55 63 L64 53 L70 59 L74 55 L83 63 Z" fill="#5585D6" opacity=".9" />
      <circle cx="78" cy="48.5" r="2.6" fill="#9DB8E3" />
      <rect x="21" y="70" width="28" height="2.6" rx="1.3" fill="#8E9AAA" />
      <rect x="21" y="76" width="20" height="2.6" rx="1.3" fill="#4B5563" />
      <rect x="52" y="71" width="34" height="2.6" rx="1.3" fill="#8E9AAA" opacity=".7" />
      <rect x="98" y="34" width="10" height="9" rx="1.5" fill="#172B43" stroke="rgb(197 205 216 / .35)" strokeWidth=".6" />
      <rect x="98" y="45" width="10" height="9" rx="1.5" fill="#5585D6" />
      <rect x="98" y="56" width="10" height="9" rx="1.5" fill="#9DB8E3" />
      <rect x="98" y="67" width="10" height="9" rx="1.5" fill="#C9A779" />
      <path d="M58 78 L92 103" stroke="url(#pr-silver)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M58 78 L53 74.5" stroke="url(#pr-gold)" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  build: (
    <>
      <rect x="24" y="24" width="72" height="48" rx="5" fill="#091321" stroke="url(#pr-silver)" strokeWidth="2.2" />
      <rect x="28" y="28" width="64" height="40" rx="2.5" fill="url(#pr-screen)" />
      <g stroke="#5585D6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".45" filter="url(#pr-blur)">
        <path d="M49 40 L41 48 L49 56 M71 40 L79 48 L71 56 M64 37 L56 59" />
      </g>
      <g stroke="#9DB8E3" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M49 40 L41 48 L49 56 M71 40 L79 48 L71 56 M64 37 L56 59" />
      </g>
      <path d="M14 76 H106 L112 86 Q112 88 110 88 H10 Q8 88 8 86 Z" fill="url(#pr-silver)" />
      <path d="M50 76 h20 v2.5 q0 1 -1 1 h-18 q-1 0 -1 -1 Z" fill="#4B5563" />
      <path d="M10 88 H110" stroke="rgb(9 19 33 / .5)" strokeWidth="1" />
    </>
  ),
  launch: (
    <>
      <g fill="rgb(245 246 248 / .14)">
        <circle cx="40" cy="100" r="10" /><circle cx="52" cy="104" r="12" /><circle cx="67" cy="102" r="10" /><circle cx="30" cy="104" r="7" />
      </g>
      <g transform="rotate(18 56 58)">
        <path d="M51 76 Q56 104 61 76 Z" fill="url(#pr-flame)" filter="url(#pr-blur)" opacity=".8" />
        <path d="M52.5 76 Q56 96 59.5 76 Z" fill="#F5E3BC" />
        <path d="M56 14 C67 26 69 48 65.5 76 H46.5 C43 48 45 26 56 14 Z" fill="url(#pr-silver)" />
        <path d="M56 14 C61 20 64 28 65 38 H47 C48 28 51 20 56 14 Z" fill="url(#pr-gold)" opacity=".9" />
        <circle cx="56" cy="46" r="6.2" fill="#172B43" stroke="url(#pr-gold)" strokeWidth="1.8" />
        <circle cx="54.2" cy="44.2" r="1.6" fill="#9DB8E3" />
        <path d="M46.8 60 L37 78 L47.5 74 Z" fill="url(#pr-gold)" />
        <path d="M65.2 60 L75 78 L64.5 74 Z" fill="url(#pr-gold)" />
        <rect x="47" y="74" width="18" height="3.5" rx="1.2" fill="#8E9AAA" />
      </g>
      <circle cx="88" cy="84" r="14" fill="#0B1628" stroke="url(#pr-gold)" strokeWidth="2.2" />
      <path d="M81 84.5 L86 89.5 L95 79" stroke="#C9A779" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
}

export default function Process() {
  return (
    <section id="process" className="process on-dark" aria-labelledby="process-title" data-process>
      {/* Shared paints for the medallion drawings. Sized 0 but not hidden:
          gradients inside a hidden SVG do not paint in every browser. */}
      <svg className="process__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pr-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2DDB3" /><stop offset=".5" stopColor="#C9A779" /><stop offset="1" stopColor="#8A6C44" />
          </linearGradient>
          <linearGradient id="pr-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#C5CDD8" /><stop offset="1" stopColor="#6B7686" />
          </linearGradient>
          <linearGradient id="pr-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#172B43" /><stop offset="1" stopColor="#0B1628" />
          </linearGradient>
          <linearGradient id="pr-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F5E3BC" /><stop offset="1" stopColor="#C9A779" stopOpacity="0" />
          </linearGradient>
          <filter id="pr-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" /></filter>
        </defs>
      </svg>
      <div className="process__sky" aria-hidden="true" />

      <div className="wrap">
        <header className="process__head">
          <p className="t-label">תהליך</p>
          <h2 id="process-title" className="t-h2" data-reveal="chars">
            <span className="line"><Split text="תהליך העבודה שלנו" /></span>
          </h2>
          <p className="process__sub">מרעיון ראשוני לנוכחות דיגיטלית מדויקת</p>
        </header>

        <div className="steps-wrap">
          {/* The gold line, drawn in place by lib/motion/process.ts. */}
          <svg className="journey" aria-hidden="true" focusable="false" data-journey>
            <path className="journey__glow" />
            <path className="journey__line" />
          </svg>
          <ol className="steps">
            {processSteps.map((s, i) => (
              <li key={s.id} className={`step${i % 2 ? ' step--flip' : ''}`} data-step>
                <div className="step__disc" data-step-disc aria-hidden="true">
                  <svg viewBox="0 0 120 120">{ART[s.id]}</svg>
                </div>
                <div className="step__card glass">
                  <h3 className="step__title"><span className="num">{i + 1}.</span> {s.title}</h3>
                  <span className="step__rule" aria-hidden="true" />
                  <p className="step__text">{s.text}</p>
                  <p className="step__out"><span>תוצר:</span> {s.out}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
