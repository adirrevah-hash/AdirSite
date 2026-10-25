import { services } from '@/lib/site'
import Blueprint from './Blueprint'
import ServiceVisual from './ServiceVisual'
import Split from './Split'

// Six services as a row of cards. With motion the section holds and the row
// travels sideways past the reader, with a meter counting the cards; without
// it they sit in a plain grid. A large outlined word drifts behind the row.
export default function Services() {
  const total = String(services.length).padStart(2, '0')
  return (
    <section id="services" className="services on-light bg-off-white" aria-labelledby="services-title">
      <Blueprint />
      <div className="services__room x-room">
        <div className="services__pin x-pin">
          <p className="ghost-word services__ghost" aria-hidden="true" data-ghost>שירותים</p>
          <div className="services__track x-track">
            <header className="services__head">
              <p className="t-label">שירותים</p>
              <h2 id="services-title" className="t-h2" data-reveal="chars">
                <span className="line"><Split text="מה בונים" /></span>
                <span className="line"><Split text="בסטודיו." /></span>
              </h2>
              <p className="t-lede">שישה שירותים שעובדים יחד: מהסימן הראשון של המותג ועד האתר שממשיך לעבוד אחרי ההשקה.</p>
              <p className="x-cue" aria-hidden="true"><span>גללו</span><i /></p>
            </header>

            <ol className="services__list">
              {services.map((s, i) => (
                <li key={s.id} className="svc-item" data-svc={s.id}>
                  <div className="svc-item__visual" aria-hidden="true">
                    <span className="svc-item__num num">{String(i + 1).padStart(2, '0')}</span>
                    <ServiceVisual id={s.id} />
                  </div>
                  <h3 className="t-h3">{s.title}</h3>
                  <p className="t-body">{s.text}</p>
                  <p className="svc-item__value">{s.value}</p>
                  <a href="#contact" className="link" data-service={s.formValue}>לבקש הצעה <span className="btn__arrow" aria-hidden="true">←</span></a>
                </li>
              ))}
            </ol>
          </div>

          <div className="row-meter" aria-hidden="true">
            <span className="num" data-row-count>01</span>
            <i><b data-row-bar /></i>
            <span className="num">{total}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
