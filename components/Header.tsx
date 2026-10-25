import { nav, site, whatsappUrl, CTA } from '@/lib/site'

// Static markup; lib/motion/header.ts adds the scrolled state and the menu.
export default function Header() {
  return (
    <>
      <header className="site-header on-dark" data-header>
        <div className="wrap site-header__row">
          <a href="#top" className="wordmark" aria-label={`${site.name}, לראש העמוד`}>
            <span className="wordmark__mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="wordmark__text">{site.name}</span>
          </a>
          <nav className="site-nav" aria-label="ראשי">
            {nav.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
          <div className="site-header__end">
            <a href="#contact" className="btn btn--light btn--sm site-header__cta">{CTA.primary}</a>
            <button type="button" className="menu-btn" aria-expanded="false" aria-controls="menu-sheet" aria-label="פתיחת התפריט" data-menu-btn>
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="menu-sheet" className="menu-sheet on-dark" data-menu hidden>
        <nav aria-label="תפריט" className="menu-sheet__nav">
          {nav.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>
        <div className="menu-sheet__foot">
          <a href="#contact" className="btn btn--light">{CTA.primary}</a>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="link">וואטסאפ <span className="num">{site.phone.display}</span></a>
        </div>
      </div>
    </>
  )
}
