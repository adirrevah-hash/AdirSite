'use client'

import { useEffect } from 'react'

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

// Act progress -> the four stages. Each stage owns a window of the pin and
// the last tenth holds the finished site still, so the build lands.
const STAGES = [
  { at: 0, draw: [0.02, 0.18] },   // the frame
  { at: 0.2, draw: [0.2, 0.42] },  // the wireframe
  { at: 0.44 },                    // colour, then type
  { at: 0.74 },                    // live
]

export default function ProcessMotion() {
  useEffect(() => {
    const sec = document.getElementById('process')
    if (!sec) return
    const stage = sec.querySelector<HTMLElement>('[data-sc-stage]')!
    const frame = sec.querySelector<SVGGElement>('.build__frame')!
    const lines = [...sec.querySelectorAll<SVGGeometryElement>('.ln')]
    const bars = [...sec.querySelectorAll<SVGElement>('.bar')]
    const fills = [...sec.querySelectorAll<SVGElement>('.fill')]
    const txt = sec.querySelector<SVGGElement>('.txt')!
    const live = sec.querySelector<SVGGElement>('.live')!
    const stepEls = [...sec.querySelectorAll<HTMLElement>('.step')]
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    // Group lines by stage, then spread each group's draw across its window.
    const groups = [0, 1].map(d => lines.filter(l => l.dataset.d === String(d)))
    lines.forEach(l => { l.style.strokeDasharray = '1'; l.style.strokeDashoffset = '1' })

    let last = -1, raf = 0, active = -1

    const paint = (p: number) => {
      groups.forEach((g, gi) => {
        const [a, b] = STAGES[gi].draw!
        const step = (b - a) / (g.length + 2)
        g.forEach((l, i) => {
          const t = easeOut(span(p, a + i * step, a + (i + 3) * step))
          l.style.strokeDashoffset = (1 - t).toFixed(4)
        })
      })
      fills.forEach((f, i) => { f.style.opacity = easeOut(span(p, 0.44 + i * 0.016, 0.52 + i * 0.016)).toFixed(3) })
      const ty = easeOut(span(p, 0.58, 0.7))
      txt.style.opacity = ty.toFixed(3)
      bars.forEach(b => { b.style.opacity = (1 - ty).toFixed(3) })
      const lv = easeOut(span(p, 0.76, 0.88))
      live.style.opacity = lv.toFixed(3)
      frame.style.setProperty('--lift', (lv * 0.22).toFixed(3))
      frame.style.transform = reduce ? 'none' : `scale(${(0.965 + 0.035 * lv).toFixed(4)})`

      const cur = p >= STAGES[3].at ? 3 : p >= STAGES[2].at ? 2 : p >= STAGES[1].at ? 1 : 0
      if (cur !== active) {
        stepEls.forEach((el, i) => {
          el.classList.toggle('is-active', i === cur)
          el.classList.toggle('is-done', i < cur)
        })
        active = cur
      }
      stage.setAttribute('data-sc-verify-state', `${cur}/${lines.filter(l => l.style.strokeDashoffset !== '1.0000').length}/${ty.toFixed(1)}/${lv.toFixed(1)}`)
      stage.setAttribute('data-sc-verify-hold', p > 0.9 && p < 1 ? 'true' : 'false')
    }

    if (reduce) {
      // Fewer and gentler: the finished drawing, steps advancing by opacity only.
      paint(1)
      stepEls.forEach(el => el.classList.remove('is-done'))
    }

    // Progress of our own rather than the act's: it starts while the section
    // is still sliding in, so the frame is already drawing when the pin takes
    // hold instead of the visitor arriving at an empty half-screen.
    const progress = () => {
      const r = sec.getBoundingClientRect()
      const lead = innerHeight * 0.55
      const travel = Math.max(sec.offsetHeight - innerHeight, 1)
      return clamp01((lead - r.top) / (travel + lead))
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = progress()
      if (p === last) return
      last = p
      if (reduce) {
        const cur = Math.min(3, Math.floor(p * 4))
        stepEls.forEach((el, i) => el.classList.toggle('is-active', i === cur))
        return
      }
      paint(p)
    }
    if (!reduce) paint(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return null
}
