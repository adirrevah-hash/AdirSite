// The cookie notice along the bottom edge. Hidden in the markup; lib/motion/
// cookies.ts shows it until the visitor approves, and remembers the approval.
export default function CookieBar() {
  return (
    <section className="cookie-bar glass on-dark" aria-label="הודעה על שימוש בעוגיות" hidden data-cookie-bar>
      <p className="cookie-bar__text">
        האתר משתמש בעוגיות ובטכנולוגיות דומות כדי לפעול כראוי, לשמור את ההעדפות שלכם ולשפר את חוויית הגלישה. פרטים נוספים ב
        <button type="button" className="inline-link" data-dialog="dlg-privacy" aria-haspopup="dialog">מדיניות הפרטיות</button>.
      </p>
      <button type="button" className="btn btn--light cookie-bar__ok" data-cookie-ok>אישור</button>
    </section>
  )
}
