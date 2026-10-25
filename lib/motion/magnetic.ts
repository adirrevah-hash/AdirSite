import { gsap } from 'gsap'

// Primary calls to action lean toward a nearby mouse. Fine pointers only,
// never under reduced motion, and the element always springs back.
export function initMagnetic(reduced: boolean) {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  const els = [...document.querySelectorAll<HTMLElement>('[data-magnetic]')]
  const offs = els.map(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35)
    }
    const leave = () => { xTo(0); yTo(0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); gsap.set(el, { x: 0, y: 0 }) }
  })
  return () => offs.forEach(o => o())
}
