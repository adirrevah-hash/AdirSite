import { CTA, whatsappUrl } from '@/lib/site'
import Split from './Split'

// The turn toward the conversation. A louvre of dark bars closes over the
// light chapter above, then one line arrives from very close and settles at
// reading size. Without motion it is simply a dark band with the line.
export default function Statement() {
  return (
    <section className="statement on-dark bg-midnight" aria-labelledby="statement-title" data-statement>
      <div className="shutter" aria-hidden="true" data-shutter>
        {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
      </div>
      <div className="statement__stage" data-statement-pin>
        <div className="wrap statement__inner">
          <h2 id="statement-title" className="statement__title" data-zoom>
            <span className="statement__line"><Split text="הגיע הזמן" /></span>
            <span className="statement__line"><Split text="שהאתר יעבוד" /></span>
            <span className="statement__line statement__line--soft"><Split text="בשבילכם." /></span>
          </h2>
          <div className="statement__actions" data-statement-cta>
            <a href="#contact" className="btn btn--light" data-magnetic>{CTA.primary} <span className="btn__arrow" aria-hidden="true">←</span></a>
            <a href={whatsappUrl('היי ARStudio, אשמח לשמוע על בניית אתר')} target="_blank" rel="noopener noreferrer" className="link">או בוואטסאפ</a>
          </div>
        </div>
      </div>
    </section>
  )
}
