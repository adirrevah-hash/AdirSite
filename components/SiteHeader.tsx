'use client'

import { useEffect, useRef, useState } from 'react'
import { nav, site, whatsappUrl, CTA_LABEL } from '@/lib/site'

type Tone = 'paper' | 'blue' | 'navy'

export default function SiteHeader() {
  const [tone, setTone] = useState<Tone>('paper')
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

  // The header takes the tone of whatever section is currently under it, so it
  // never sits as a paper bar on a blue chapter or the other way round.
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const probe = document.elementsFromPoint(innerWidth / 2, 2).find(
        el => el instanceof HTMLElement && el.dataset.tone && !el.closest('.site-header')
      ) as HTMLElement | undefined
      const t = probe?.dataset.tone as Tone | undefined
      if (t) setTone(t)
      setSolid(scrollY > 8)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    // Sections can change tone without a scroll event (the hero turns blue
    // inside its own animation frame), so they announce it.
    addEventListener('tonechange', onScroll)
    addEventListener('scrollcraft:ready', onScroll)
    return () => {
      removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll)
      removeEventListener('tonechange', onScroll); removeEventListener('scrollcraft:ready', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheet.current?.querySelector<HTMLElement>('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); menuBtn.current?.focus() }
      if (e.key === 'Tab' && sheet.current) {
        const f = [menuBtn.current!, ...sheet.current.querySelectorAll<HTMLElement>('a')]
        const i = f.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
      }
    }
    addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; removeEventListener('keydown', onKey) }
  }, [open])

  const shownTone: Tone = open ? 'navy' : tone

  return (
    <>
      <header className={`site-header${solid || open ? ' is-solid' : ''}`} data-tone={shownTone}>
        <div className="wrap flex h-full items-center justify-between gap-6">
          <a href="#top" className="mark text-[1.7rem] leading-none py-3" aria-label={`${site.name}, לראש העמוד`} onClick={() => setOpen(false)}>
            {site.name}
          </a>
          <nav className="nav hidden md:flex items-center gap-7" aria-label="ראשי">
            {nav.map(n => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#contact" className="btn btn--solid header-cta hidden md:inline-flex">{CTA_LABEL}</a>
            <button
              ref={menuBtn}
              type="button"
              className="md:hidden grid place-items-center w-11 h-11 -me-2"
              aria-expanded={open}
              aria-controls="menu-sheet"
              aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
              onClick={() => setOpen(o => !o)}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                {open
                  ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  : <path d="M4 8h16M8 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div id="menu-sheet" ref={sheet} className={`menu-sheet md:hidden${open ? ' is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <nav aria-label="תפריט" className="grid gap-1">
          {nav.map(n => <a key={n.href} href={n.href} className="menu-link" onClick={() => setOpen(false)}>{n.label}</a>)}
        </nav>
        <div className="mt-auto grid gap-3 text-[1.05rem]">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="textlink">וואטסאפ: {site.phone.display}</a>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="textlink">אינסטגרם</a>
        </div>
      </div>
    </>
  )
}
