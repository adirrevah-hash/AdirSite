import { legal } from '@/lib/legal'
import { site } from '@/lib/site'
import { IconClose, IconFacebook, IconInstagram } from './icons'

// The close of the page: the wordmark, the social channels as icon buttons,
// and the three legal documents, each opening in a side panel.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer on-dark bg-graphite">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__word" aria-hidden="true" data-footer-word>{[...'ARStudio'].map((ch, i) => <span key={i}>{ch}</span>)}</p>
          <p className="footer__line">אתרי תדמית, דפי נחיתה וזהות חזותית לעסקים.</p>
        </div>

        <div className="footer__row">
          <div className="footer__social">
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="social-btn glass" aria-label="אינסטגרם">
              <IconInstagram width={22} height={22} />
            </a>
            {site.facebook ? (
              <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="social-btn glass" aria-label="פייסבוק">
                <IconFacebook width={22} height={22} />
              </a>
            ) : (
              // No Facebook address yet: shown, but not a link that goes nowhere.
              <span className="social-btn glass is-pending" title="הקישור לפייסבוק יתווסף בקרוב">
                <IconFacebook width={22} height={22} aria-hidden="true" />
                <span className="sr-only">פייסבוק, הקישור יתווסף בקרוב</span>
              </span>
            )}
          </div>

          <ul className="footer__legal-links">
            {legal.map(d => (
              <li key={d.id}>
                <button type="button" className="legal-btn" data-dialog={`dlg-${d.id}`} aria-haspopup="dialog">
                  {d.title} <span className="btn__arrow" aria-hidden="true">←</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__legal">
          <span>© <span className="num">{year}</span> {site.name}</span>
          <a href="#top">חזרה למעלה</a>
        </div>
      </div>

      {legal.map(d => (
        <dialog key={d.id} id={`dlg-${d.id}`} className="pdialog legal-dialog on-dark" aria-labelledby={`dlg-${d.id}-title`}>
          <div className="pdialog__panel glass">
            <header className="pdialog__head">
              <div>
                <p className="t-label">עודכן לאחרונה: {d.updated}</p>
                <h2 id={`dlg-${d.id}-title`} className="t-h2">{d.title}</h2>
              </div>
              <button type="button" className="pdialog__close" data-dialog-close aria-label="סגירה"><IconClose width={22} height={22} /></button>
            </header>
            <div className="legal-body">
              {d.sections.map((s, i) => (
                <section key={i}>
                  {s.h && <h3>{s.h}</h3>}
                  {s.p.map((t, j) => <p key={j}>{t}</p>)}
                </section>
              ))}
            </div>
          </div>
        </dialog>
      ))}
    </footer>
  )
}
