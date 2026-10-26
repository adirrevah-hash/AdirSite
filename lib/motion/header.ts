// Scrolled state for the header, and the mobile menu (focus kept inside,
// Escape and link taps close it, the page held still while open).
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]')
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]')
  const sheet = document.querySelector<HTMLElement>('[data-menu]')
  if (!header || !btn || !sheet) return () => {}

  let raf = 0
  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; header.classList.toggle('is-scrolled', scrollY > 12) })
  }
  onScroll()
  addEventListener('scroll', onScroll, { passive: true })

  // The sheet is laid out once, now, and kept ready (invisible and inert
  // through CSS until opened), so opening never has to build it.
  sheet.hidden = false
  sheet.inert = true
  let open = false
  const focusables = () => [btn, ...sheet.querySelectorAll<HTMLElement>('a, button')]
  const set = (next: boolean) => {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט')
    header.classList.toggle('is-open', open)
    // The page is held still by refusing scroll gestures (below), not by a
    // style on <html>: any change there re-checks every element's style and
    // re-measures the page, which stutters the menu.
    sheet.inert = !open
    if (open) {
      // How far the 120px veil must grow to cover the screen from the button.
      sheet.style.setProperty('--veil', String(Math.ceil((2 * Math.hypot(innerWidth, innerHeight)) / 120) + 1))
      // Two frames: the sheet is laid out closed first, so the opening animates.
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')))
      sheet.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    } else {
      sheet.classList.remove('is-open')
    }
  }
  const onBtn = () => set(!open)
  const onKey = (e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') { set(false); btn.focus() }
    if (e.key === 'Tab') {
      const f = focusables(), i = f.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus() }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus() }
    }
  }
  const onSheetClick = (e: Event) => { if ((e.target as Element).closest('a')) set(false) }
  const SCROLL_KEYS = [' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']
  const hold = (e: Event) => { if (open) e.preventDefault() }
  const holdKeys = (e: KeyboardEvent) => { if (open && SCROLL_KEYS.includes(e.key) && !(e.target as Element).closest('button, a')) e.preventDefault() }
  const onResize = () => { if (open && innerWidth >= 960) set(false) }
  btn.addEventListener('click', onBtn)
  sheet.addEventListener('click', onSheetClick)
  addEventListener('keydown', onKey)
  addEventListener('resize', onResize)
  addEventListener('wheel', hold, { passive: false })
  addEventListener('touchmove', hold, { passive: false })
  addEventListener('keydown', holdKeys)

  return () => {
    removeEventListener('scroll', onScroll)
    btn.removeEventListener('click', onBtn)
    sheet.removeEventListener('click', onSheetClick)
    removeEventListener('keydown', onKey)
    removeEventListener('resize', onResize)
    removeEventListener('wheel', hold)
    removeEventListener('touchmove', hold)
    removeEventListener('keydown', holdKeys)
    sheet.classList.remove('is-open')
    sheet.inert = false
    sheet.hidden = true
  }
}
