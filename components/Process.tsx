import { processSteps } from '@/lib/site'

// Four steps on one silver line. Readable as plain content; with motion the
// line draws as the reader moves through it and each node lights in turn.
export default function Process() {
  return (
    <section id="process" className="process on-dark bg-navy" aria-labelledby="process-title" data-process>
      <div className="wrap">
        <header className="process__head">
          <p className="t-label">תהליך</p>
          <h2 id="process-title" className="t-h2" data-reveal="lines">
            <span className="line"><span>מהשיחה הראשונה</span></span>
            <span className="line"><span>ועד אתר באוויר.</span></span>
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
