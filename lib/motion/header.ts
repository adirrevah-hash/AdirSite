// Scrolled state for the header, and the mobile menu (focus kept inside,
// Escape and link taps close it, page scroll locked while open).
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

  let open = false
  const focusables = () => [btn, ...sheet.querySelectorAll<HTMLElement>('a, button')]
  const set = (next: boolean) => {
    open = next
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', open ? 'סגירת התפריט' : 'פתיחת התפריט')
    header.classList.toggle('is-open', open)
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) {
      sheet.hidden = false
      requestAnimationFrame(() => sheet.classList.add('is-open'))
      sheet.querySelector<HTMLElement>('a')?.focus()
    } else {
      sheet.classList.remove('is-open')
      setTimeout(() => { if (!open) sheet.hidden = true }, 260)
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
  const onResize = () => { if (open && innerWidth >= 960) set(false) }
  btn.addEventListener('click', onBtn)
  sheet.addEventListener('click', onSheetClick)
  addEventListener('keydown', onKey)
  addEventListener('resize', onResize)

  return () => {
    removeEventListener('scroll', onScroll)
    btn.removeEventListener('click', onBtn)
    sheet.removeEventListener('click', onSheetClick)
    removeEventListener('keydown', onKey)
    removeEventListener('resize', onResize)
    document.documentElement.style.overflow = ''
  }
}
