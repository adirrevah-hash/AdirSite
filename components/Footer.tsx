import { nav, site, whatsappUrl } from '@/lib/site'
import { services } from '@/lib/site'

// The page ends where it started: the wordmark, closed with the same blue
// circle that opened out of its "d" in the hero.
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" data-tone="paper">
      <div className="wrap">
        <p className="m-0" aria-hidden="true">
          <span className="footer__mark mark">ARStudio<span className="footer__dot" /></span>
        </p>
        <div className="footer__cols">
          <div>
            <h2>הסטודיו</h2>
            <p className="m-0 max-w-[36ch] text-ink-soft">{site.description}</p>
          </div>
          <div>
            <h2>שירותים</h2>
            <ul>
              {services.map(s => <li key={s.id}><a href="#contact" data-service={s.id} className="textlink">{s.title}</a></li>)}
            </ul>
          </div>
          <div>
            <h2>יצירת קשר</h2>
            <ul>
              <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="textlink">וואטסאפ</a></li>
              <li><a href={`tel:${site.phone.tel}`} className="textlink" dir="ltr">{site.phone.display}</a></li>
              <li><a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="textlink">אינסטגרם</a></li>
              {site.email && <li><a href={`mailto:${site.email}`} className="textlink">{site.email}</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>© {year} {site.name}</span>
          <nav aria-label="תחתון" className="flex gap-5">
            {nav.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
        </div>
      </div>
    </footer>
  )
}
