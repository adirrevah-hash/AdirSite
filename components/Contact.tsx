import Split from './Split'
import { site, whatsappUrl } from '@/lib/site'
import { SERVICE_OPTIONS } from '@/lib/contact'
import { IconWhatsApp, IconPhone, IconInstagram, IconArrow } from './icons'

// Conversion. The form is plain markup; lib/motion/form.ts validates it and
// opens WhatsApp to the studio with everything filled in already written.
export default function Contact() {
  return (
    <section id="contact" className="contact on-dark bg-midnight" aria-labelledby="contact-title">
      <div className="contact__glow" aria-hidden="true" />
      <div className="wrap contact__grid">
        <div className="contact__intro">
          <p className="t-label">יצירת קשר</p>
          <h2 id="contact-title" className="t-h2" data-reveal="chars">
            <span className="line"><Split text="בואו נבנה את" /></span>
            <span className="line"><Split text="הנוכחות הדיגיטלית שלכם." /></span>
          </h2>
          <p className="t-lede">משאירים פרטים ונחזור אליכם, או כותבים ישר לוואטסאפ. השיחה הראשונה היא כדי להבין מה העסק צריך.</p>
          <ul className="channels">
            <li><a href={whatsappUrl('היי ARStudio, אשמח לשמוע פרטים')} target="_blank" rel="noopener noreferrer"><IconWhatsApp /><span>וואטסאפ<small className="num">{site.phone.display}</small></span><IconArrow className="channels__arrow" /></a></li>
            <li><a href={`tel:${site.phone.tel}`}><IconPhone /><span>טלפון<small className="num">{site.phone.display}</small></span><IconArrow className="channels__arrow" /></a></li>
            <li><a href={site.instagram.url} target="_blank" rel="noopener noreferrer"><IconInstagram /><span>אינסטגרם<small className="num">@{site.instagram.handle}</small></span><IconArrow className="channels__arrow" /></a></li>
          </ul>
        </div>

        <form className="lead-form glass" noValidate data-lead-form aria-labelledby="contact-title">
          <div className="field">
            <label htmlFor="f-name">שם</label>
            <input id="f-name" name="name" type="text" autoComplete="name" required maxLength={80} />
          </div>
          <div className="field">
            <label htmlFor="f-phone">טלפון</label>
            <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required placeholder="050-1234567" aria-describedby="f-phone-hint" />
            <p id="f-phone-hint" className="field__hint">נחזור אליכם למספר הזה.</p>
          </div>
          <div className="field">
            <label htmlFor="f-service">במה אפשר לעזור?</label>
            <select id="f-service" name="service" required defaultValue="">
              <option value="" disabled>בחירת שירות</option>
              {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-message">כמה מילים על העסק <span className="field__opt">(לא חובה)</span></label>
            <textarea id="f-message" name="message" rows={4} maxLength={1000} />
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="f-company">חברה</label>
            <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="lead-form__submit">
            <button type="submit" className="btn btn--light" data-submit>שליחת פרטים <span className="btn__arrow" aria-hidden="true">←</span></button>
            <p className="lead-form__note">הפרטים משמשים רק כדי לחזור אליכם בנוגע לפנייה.</p>
          </div>
          <div className="form-status" role="status" aria-live="polite" tabIndex={-1} data-status hidden />
        </form>
      </div>
    </section>
  )
}
