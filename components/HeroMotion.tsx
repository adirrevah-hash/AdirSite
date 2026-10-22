'use client'

import { useEffect } from 'react'

// Bowl of Archivo's lowercase d, as fractions of the glyph advance and the em.
// Tuned against the render.
const BOWL_X = 0.4
const BOWL_Y = 0.27

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

export default function HeroMotion() {
  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const stage = hero.querySelector<HTMLElement>('[data-sc-stage]')!
    const mark = hero.querySelector<HTMLElement>('.hero__mark')!
    const ghost = hero.querySelector<HTMLElement>('.hero__ghost')!
    const iris = hero.querySelector<HTMLElement>('.hero__iris')!
    const dEl = hero.querySelector<HTMLElement>('.hero__d')!
    const bl = hero.querySelector<HTMLElement>('.hero__bl')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    let ox = 0, oy = 0, maxR = 0, last = -1, raf = 0

    const fit = (el: HTMLElement, w: number, h: number) => {
      el.style.fontSize = '100px'
      let fs = (w * 100) / el.offsetWidth
      fs = Math.min(fs, h / (el.offsetHeight / 100))
      el.style.fontSize = fs.toFixed(1) + 'px'
    }

    const layout = () => {
      const vw = innerWidth, vh = innerHeight
      // Keep in step with the first-paint sizes in globals.css (.hero__mark).
      fit(mark, vw * (vw < 760 ? 0.9 : 0.88), vh * (vw < 760 ? 0.16 : 0.3))
      ghost.style.fontSize = (parseFloat(mark.style.fontSize) * 1.55).toFixed(1) + 'px'
      mark.style.transform = ghost.style.transform = 'none'
      const s = stage.getBoundingClientRect(), d = dEl.getBoundingClientRect(), b = bl.getBoundingClientRect()
      const fs = parseFloat(mark.style.fontSize)
      ox = d.left - s.left + d.width * BOWL_X
      oy = b.top - s.top - fs * BOWL_Y
      const m = mark.getBoundingClientRect(), g = ghost.getBoundingClientRect()
      mark.style.transformOrigin = `${(ox - (m.left - s.left)).toFixed(1)}px ${(oy - (m.top - s.top)).toFixed(1)}px`
      ghost.style.transformOrigin = `${(ox - (g.left - s.left)).toFixed(1)}px ${(oy - (g.top - s.top)).toFixed(1)}px`
      maxR = Math.hypot(Math.max(ox, s.width - ox), Math.max(oy, s.height - oy)) + 4
      last = -1
    }

    const draw = () => {
      raf = requestAnimationFrame(draw)
      const p = parseFloat(hero.style.getPropertyValue('--sc-p')) || 0
      if (p === last) return
      last = p
      const t = clamp01((p - 0.02) / 0.66)
      const o = clamp01((p - 0.16) / 0.46)
      let ms = 1, gs = 1, r = 0
      if (reduce) {
        iris.style.clipPath = 'none'
        iris.style.opacity = o.toFixed(3)
      } else {
        ms = Math.pow(10, t * t)
        gs = Math.pow(1.6, t)
        r = Math.pow(o, 1.7) * maxR
        mark.style.transform = `scale(${ms.toFixed(4)})`
        ghost.style.transform = `scale(${gs.toFixed(4)})`
        iris.style.clipPath = `circle(${r.toFixed(1)}px at ${ox.toFixed(1)}px ${oy.toFixed(1)}px)`
      }
      // Once the blue owns the top of the frame, the header should read as on blue.
      const tone = o > 0.62 ? 'blue' : 'paper'
      if (hero.dataset.tone !== tone) { hero.dataset.tone = tone; dispatchEvent(new Event('tonechange')) }
      stage.setAttribute('data-sc-verify-state', `${ms.toFixed(2)}/${gs.toFixed(2)}/${reduce ? o.toFixed(2) : Math.round(r)}`)
    }

    let rz = 0
    const onResize = () => { clearTimeout(rz); rz = window.setTimeout(layout, 120) }
    layout()
    document.fonts?.ready.then(layout)
    addEventListener('resize', onResize)
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', onResize); clearTimeout(rz) }
  }, [])

  return null
}
