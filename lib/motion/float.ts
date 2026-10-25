// The floating WhatsApp button: off over the hero, on while reading, and out
// of the way once the contact section or footer is on screen.
export function initFloat() {
  const fab = document.querySelector<HTMLElement>('[data-wa-float]')
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (!fab) return () => {}
  const blockers = ['#contact', 'footer'].map(s => document.querySelector(s)).filter(Boolean) as Element[]
  const visible = new Set<Element>()
  let past = false
  const paint = () => {
    const on = past && visible.size === 0
    fab.classList.toggle('is-on', on)
    fab.tabIndex = on ? 0 : -1
    fab.setAttribute('aria-hidden', String(!on))
  }
  const onScroll = () => { past = scrollY > (hero?.offsetHeight ?? innerHeight) * 0.75; paint() }
  const io = new IntersectionObserver(es => { es.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))); paint() }, { threshold: 0.12 })
  blockers.forEach(b => io.observe(b))
  onScroll()
  addEventListener('scroll', onScroll, { passive: true })
  return () => { io.disconnect(); removeEventListener('scroll', onScroll) }
}
