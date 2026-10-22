import { site, whatsappUrl } from '@/lib/site'
import ContactForm from './ContactForm'
import { IconWhatsApp, IconPhone, IconInstagram } from './icons'

export default function Contact() {
  return (
    <section id="contact" className="contact" data-tone="forest" aria-labelledby="contact-title">
      <div className="wrap contact__grid">
        <div data-sc-in data-sc-stagger="70">
          <h2 id="contact-title" className="display display-lg m-0">בואו נדבר על העסק שלכם.</h2>
          <p className="lede mt-6">משאירים פרטים ונחזור אליכם, או כותבים ישר לוואטסאפ. שיחה ראשונה היא כדי להבין מה צריך.</p>
          <ul className="channels">
            <li>
              <a href={whatsappUrl('היי ARStudio, אשמח לשמוע פרטים על ')} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center gap-4"><IconWhatsApp /><span>וואטסאפ<small dir="ltr" className="text-right">{site.phone.display}</small></span></span>
                <span className="arrow" aria-hidden="true">←</span>
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.tel}`}>
                <span className="flex items-center gap-4"><IconPhone /><span>טלפון<small dir="ltr" className="text-right">{site.phone.display}</small></span></span>
                <span className="arrow" aria-hidden="true">←</span>
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center gap-4"><IconInstagram /><span>אינסטגרם<small dir="ltr" className="text-right">@{site.instagram.handle}</small></span></span>
                <span className="arrow" aria-hidden="true">←</span>
              </a>
            </li>
          </ul>
        </div>
        <div data-sc-in>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
