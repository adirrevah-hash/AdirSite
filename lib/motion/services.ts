import { gsap } from 'gsap'
import { cardRow } from './sideways'

// The services travel sideways while the section holds: each card lifts in
// as it arrives, the meter counts them, and the outlined word behind drifts
// the other way. The business-card visual tilts toward a fine pointer.
export function initServices(reduced: boolean) {
  const room = document.querySelector<HTMLElement>('#services .x-room')
  const items = [...document.querySelectorAll<HTMLElement>('.svc-item[data-svc]')]
  if (!room || !items.length) return () => {}

  const mm = gsap.matchMedia()
  if (!reduced) {
    mm.add('(min-width: 0px)', () => cardRow(room, items, '.svc-item, .services__head'))
  }
  // A card's one-off drawing plays the first time it is on screen.
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target) } }), { threshold: 0.4 })
  items.forEach(i => io.observe(i))

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  const tilts = reduced || !fine ? [] : [...document.querySelectorAll<HTMLElement>('[data-tilt]')]
  const onMove = (e: PointerEvent) => {
    for (const t of tilts) {
      const card = t.querySelector<HTMLElement>('.sv-card--front')
      const r = t.getBoundingClientRect()
      if (!card || !r.width) continue
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      card.style.setProperty('--ry', `${(-12 + x * 18).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${(8 - y * 14).toFixed(2)}deg`)
    }
  }
  if (tilts.length) addEventListener('pointermove', onMove, { passive: true })

  return () => {
    mm.revert()
    io.disconnect()
    removeEventListener('pointermove', onMove)
  }
}
