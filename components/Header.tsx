import { nav, site, whatsappUrl, CTA } from '@/lib/site'
import { IconInstagram, IconWhatsApp } from './icons'

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

      {/* The menu: a veil that grows as a circle from the button, with numbered
          links rising in turn and the direct channels below. */}
      <div id="menu-sheet" className="menu-sheet on-dark" data-menu hidden>
        <span className="menu-sheet__veil" aria-hidden="true" />
        <span className="menu-sheet__ghost" aria-hidden="true">AR</span>
        <nav aria-label="תפריט" className="menu-sheet__nav">
          {nav.map((n, i) => (
            <a key={n.href} href={n.href} style={{ ['--i' as string]: i }}>
              <span className="menu-sheet__num num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="menu-sheet__label">{n.label}</span>
              <span className="menu-sheet__arrow" aria-hidden="true">←</span>
            </a>
          ))}
        </nav>
        <div className="menu-sheet__foot" style={{ ['--i' as string]: nav.length }}>
          <a href="#contact" className="btn btn--light">{CTA.primary} <span className="btn__arrow" aria-hidden="true">←</span></a>
          <div className="menu-sheet__social">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="social-btn menu-sheet__circle" aria-label="וואטסאפ"><IconWhatsApp width={22} height={22} /></a>
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="social-btn menu-sheet__circle" aria-label="אינסטגרם"><IconInstagram width={22} height={22} /></a>
          </div>
        </div>
      </div>
    </>
  )
}
