import { legal } from '@/lib/legal'
import { site } from '@/lib/site'
import { IconClose, IconFacebook, IconInstagram } from './icons'

// The close of the page, centred: the wordmark and its line, then one row of
// the social channels and the three legal documents (each opening in a side
// panel), set between two hairline waves in the site's silver.

// One icon per document, drawn in the same hairline as the waves.
function LegalIcon({ id }: { id: string }) {
  return (
    <svg className="legal-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      {id === 'privacy' && <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" /></>}
      {id === 'terms' && <><path d="M7 3.5h7l4 4v13H7z" /><path d="M14 3.5v4h4M10 12h5M10 15h5M10 18h3" /></>}
      {id === 'accessibility' && <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="7.6" r="1.2" /><path d="M7.5 10.2l4.5 1 4.5-1M12 11.2v3.3l-2.2 4M12 14.5l2.2 4" /></>}
    </svg>
  )
}

// The waves at either side: a soft navy body with a silver hairline crest.
function Waves() {
  return (
    <svg className="footer__waves" viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="fw-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-navy-secondary)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-midnight)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fw-line" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-silver)" stopOpacity="0" />
          <stop offset="0.18" stopColor="var(--color-silver)" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="var(--color-silver)" stopOpacity="0.08" />
          <stop offset="0.82" stopColor="var(--color-silver)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-silver)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="footer__wave-body" d="M0 190 C 180 200, 300 330, 520 330 L 920 330 C 1140 330, 1260 200, 1440 190 L 1440 420 L 0 420 Z" fill="url(#fw-body)" />
      <path className="footer__wave-line" d="M0 190 C 180 200, 300 330, 520 330 L 920 330 C 1140 330, 1260 200, 1440 190" fill="none" stroke="url(#fw-line)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      <path className="footer__wave-line footer__wave-line--back" d="M0 70 C 140 90, 220 260, 420 300 M 1440 70 C 1300 90, 1220 260, 1020 300" fill="none" stroke="url(#fw-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer on-dark">
      <Waves />
      <span className="footer__dots footer__dots--a" aria-hidden="true" />
      <span className="footer__dots footer__dots--b" aria-hidden="true" />
      <div className="wrap footer__inner">
        <p className="footer__word" aria-hidden="true" data-footer-word>
          {[...'AR'].map((ch, i) => <span key={`a${i}`} className="footer__ar">{ch}</span>)}
          {[...'Studio'].map((ch, i) => <span key={`s${i}`} className="footer__studio">{ch}</span>)}
        </p>
        <p className="footer__tagline" dir="ltr">IDEAS<i aria-hidden="true" />WEBSITES<i aria-hidden="true" />REAL RESULTS</p>

        <div className="footer__row">
          <div className="footer__social">
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
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="social-btn glass" aria-label="אינסטגרם">
              <IconInstagram width={22} height={22} />
            </a>
          </div>
          <span className="footer__divider" aria-hidden="true" />
          <ul className="footer__legal-links">
            {[...legal].reverse().map(d => (
              <li key={d.id}>
                <button type="button" className="legal-btn glass" data-dialog={`dlg-${d.id}`} aria-haspopup="dialog">
                  <span>{d.title}</span>
                  <LegalIcon id={d.id} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__base">
          <span className="footer__rule" aria-hidden="true" />
          <p className="footer__copy" dir="ltr">© <span className="num">{year}</span> <span className="footer__copy-name">ARStudio</span></p>
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
