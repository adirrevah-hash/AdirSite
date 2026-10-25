import Split from './Split'
import { processSteps } from '@/lib/site'

// Four steps on one silver line. Readable as plain content; with motion the
// section holds on wide screens while the line draws, each step lights in
// turn and the large counter rolls to the step being read.
export default function Process() {
  return (
    <section id="process" className="process on-dark bg-navy" aria-labelledby="process-title" data-process>
      <div className="wrap">
        <header className="process__head">
          <div className="process__counter num" aria-hidden="true">
            <span className="process__roll" data-process-roll>
              {processSteps.map((s, i) => <span key={s.id}>{String(i + 1).padStart(2, '0')}</span>)}
            </span>
            <span className="process__of">/ {String(processSteps.length).padStart(2, '0')}</span>
          </div>
          <p className="t-label">תהליך</p>
          <h2 id="process-title" className="t-h2" data-reveal="chars">
            <span className="line"><Split text="מהשיחה הראשונה" /></span>
            <span className="line"><Split text="ועד אתר באוויר." start={13} /></span>
          </h2>
        </header>
        <div className="steps-wrap">
          <span className="steps__rail" aria-hidden="true"><span className="steps__fill" data-process-fill /></span>
          <ol className="steps">
            {processSteps.map((s, i) => (
              <li key={s.id} className="step" data-step>
                <span className="step__node" aria-hidden="true" />
                <span className="step__num num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-body">{s.text}</p>
                <p className="step__out"><span>תוצר</span>{s.out}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
