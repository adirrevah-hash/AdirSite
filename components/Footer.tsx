import { nav, services, site, whatsappUrl } from '@/lib/site'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer on-dark bg-graphite">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__word" aria-hidden="true" data-footer-word>{[...'ARStudio'].map((ch, i) => <span key={i}>{ch}</span>)}</p>
          <p className="footer__line">אתרי תדמית, דפי נחיתה וזהות חזותית לעסקים.</p>
        </div>
        <div className="footer__cols">
          <nav aria-label="ניווט תחתון">
            <h2 className="footer__h">ניווט</h2>
            <ul>{nav.map(n => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}</ul>
          </nav>
          <div>
            <h2 className="footer__h">שירותים</h2>
            <ul>{services.map(s => <li key={s.id}><a href="#services">{s.title}</a></li>)}</ul>
          </div>
          <div>
            <h2 className="footer__h">יצירת קשר</h2>
            <ul>
              <li><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">וואטסאפ</a></li>
              <li><a href={`tel:${site.phone.tel}`} className="num">{site.phone.display}</a></li>
              <li><a href={site.instagram.url} target="_blank" rel="noopener noreferrer">אינסטגרם</a></li>
              {site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer__legal">
          <span>© <span className="num">{year}</span> {site.name}</span>
          <a href="#top">חזרה למעלה</a>
        </div>
      </div>
    </footer>
  )
}
