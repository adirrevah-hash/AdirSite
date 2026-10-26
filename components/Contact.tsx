import Split from './Split'
import { SERVICE_OPTIONS } from '@/lib/contact'

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
          <div className="field field--check">
            <input id="f-consent" name="consent" type="checkbox" required />
            <label htmlFor="f-consent">
              אני מאשר/ת את{' '}
              <button type="button" className="inline-link" data-dialog="dlg-privacy" aria-haspopup="dialog">מדיניות הפרטיות</button>
              {' '}ואת{' '}
              <button type="button" className="inline-link" data-dialog="dlg-terms" aria-haspopup="dialog">תנאי השימוש באתר</button>
            </label>
          </div>
          <div className="lead-form__submit">
            <button type="submit" className="btn btn--light" data-submit>שליחת פרטים <span className="btn__arrow" aria-hidden="true">←</span></button>
            <p className="lead-form__note">הפרטים משמשים רק כדי לחזור אליכם בנוגע לפנייה.</p>
            <a className="lead-form__fallback" data-wa-fallback hidden rel="noopener noreferrer">וואטסאפ לא נפתח? לחצו כאן לפתיחה עם הפרטים</a>
          </div>
          <p className="sr-only" role="status" aria-live="polite" data-status />
        </form>
      </div>
    </section>
  )
}
