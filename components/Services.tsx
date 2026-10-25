import { services } from '@/lib/site'
import ServiceVisual from './ServiceVisual'

// Light cards on the right, a dark stage on the left that shows the visual of
// whichever service the reader is on (scroll, hover or keyboard focus). On a
// phone each card carries its own visual, so nothing depends on hover.
export default function Services() {
  return (
    <section id="services" className="services on-light bg-off-white" aria-labelledby="services-title">
      <div className="wrap">
        <header className="services__head">
          <p className="t-label">שירותים</p>
          <h2 id="services-title" className="t-h2" data-reveal="lines">
            <span className="line"><span>מה בונים בסטודיו.</span></span>
          </h2>
          <p className="t-lede">שישה שירותים שעובדים יחד: מהסימן הראשון של המותג ועד האתר שממשיך לעבוד אחרי ההשקה.</p>
        </header>

        <div className="services__layout">
          <ol className="services__list">
            {services.map(s => (
              <li key={s.id} className="svc-item" data-svc={s.id} tabIndex={-1}>
                <div className="svc-item__visual" aria-hidden="true"><ServiceVisual id={s.id} /></div>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-body">{s.text}</p>
                <p className="svc-item__value">{s.value}</p>
                <a href="#contact" className="link" data-service={s.formValue}>לבקש הצעה <span className="btn__arrow" aria-hidden="true">←</span></a>
              </li>
            ))}
          </ol>
          <div className="services__stage on-dark" aria-hidden="true">
            <div className="services__stage-inner">
              {services.map((s, i) => (
                <div key={s.id} className={`stage-layer${i === 0 ? ' is-active' : ''}`} data-stage={s.id}>
                  <ServiceVisual id={s.id} />
                  <p className="stage-layer__label">{s.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
