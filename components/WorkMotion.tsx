'use client'

import { useEffect } from 'react'

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

// While a project crosses the viewport, its full-page screenshot scrolls
// inside the laptop screen and the phone drifts at its own rate, so the two
// devices read as separate objects in depth. Transform only; nothing reflows.
export default function WorkMotion() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = [...document.querySelectorAll<HTMLElement>('[data-project]')].map(el => ({
      el,
      view: el.querySelector<HTMLElement>('.laptop__view')!,
      shot: el.querySelector<HTMLElement>('.laptop__view .device__shot'),
      phone: el.querySelector<HTMLElement>('[data-depth]')!,
    }))
    let raf = 0
    const tick = () => {
      raf = 0
      const vh = innerHeight
      for (const it of items) {
        const r = it.el.getBoundingClientRect()
        if (r.bottom < -100 || r.top > vh + 100) continue
        const p = clamp01((vh - r.top) / (vh + r.height))
        if (it.shot) {
          const travel = Math.max(it.shot.offsetHeight - it.view.clientHeight, 0)
          const t = clamp01((p - 0.2) / 0.6)
          it.shot.style.transform = `translate3d(0, ${(-travel * t).toFixed(1)}px, 0)`
        }
        it.phone.style.transform = `translate3d(0, ${((0.5 - p) * 70).toFixed(1)}px, 0)`
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick) }
    tick()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return null
}
