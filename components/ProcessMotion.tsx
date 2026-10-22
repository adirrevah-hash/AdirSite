'use client'

import { useEffect } from 'react'

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const URL_TEXT = 'your-business.co.il'

// The timeline, in section progress. Each step owns a window; the last tenth
// holds the finished, live site still so the build lands.
const T = {
  lid: [0, 0.14],        // the laptop opens
  power: [0.13, 0.2],    // the screen wakes
  wire: [0.22, 0.44],    // the wireframe draws
  colour: [0.47, 0.6],   // colour spreads out of the circle
  scrollDown: [0.6, 0.67],
  scrollUp: [0.68, 0.74],
  type: [0.75, 0.84],    // the address types itself
  cursor: [0.8, 0.87],   // the cursor travels to the button
  click: [0.87, 0.9],
  live: [0.89, 0.93],
}
const STEP_AT = [0, 0.21, 0.46, 0.75]

export default function ProcessMotion() {
  useEffect(() => {
    const sec = document.getElementById('process')
    if (!sec) return
    const q = <E extends Element>(s: string) => sec.querySelector<E>(s)!
    const stage = q<HTMLElement>('[data-sc-stage]')
    const mac = q<HTMLElement>('.mac')
    const lid = q<HTMLElement>('.mac__lid')
    const on = q<HTMLElement>('.scr__on')
    const wire = [...sec.querySelectorAll<SVGGeometryElement>('.scr__wire > *')]
    const wireSvg = q<SVGSVGElement>('.scr__wire')
    const site = q<HTMLElement>('.scr__site')
    const page = q<HTMLElement>('.ms')
    const typed = q<HTMLElement>('.scr__typed')
    const caret = q<HTMLElement>('.scr__caret')
    const cursor = q<SVGSVGElement>('.scr__cursor')
    const ripple = q<HTMLElement>('.scr__ripple')
    const cta = q<HTMLElement>('.ms__cta')
    const live = q<HTMLElement>('.scr__live')
    const steps = [...sec.querySelectorAll<HTMLElement>('.pstep')]
    const labels = [...sec.querySelectorAll<HTMLElement>('.prail__labels li')]
    const fill = q<HTMLElement>('.prail__fill')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    wire.forEach(w => { w.style.strokeDasharray = '1' })
    let last = -1, active = -1, raf = 0

    const paint = (p: number) => {
      // 1. the lid: lying on the keyboard at -90deg, opening to a natural tilt
      const l = easeInOut(span(p, T.lid[0], T.lid[1]))
      lid.style.transform = `rotateX(${(-90 + 102 * l).toFixed(2)}deg)`
      mac.style.setProperty('--lift', (0.25 + 0.75 * l).toFixed(3))
      on.style.opacity = ease(span(p, T.power[0], T.power[1])).toFixed(3)

      // 2. the wireframe draws, element by element
      const w0 = T.wire[0], step = (T.wire[1] - w0) / (wire.length + 2)
      wire.forEach((w, i) => { w.style.strokeDashoffset = (1 - ease(span(p, w0 + i * step, w0 + (i + 3) * step))).toFixed(4) })

      // 3. colour opens out of the circle, the wireframe steps back, the page scrolls
      const c = ease(span(p, T.colour[0], T.colour[1]))
      site.style.clipPath = c >= 1 ? 'none' : `circle(${(c * 130).toFixed(2)}% at 23% 34%)`
      wireSvg.style.opacity = (1 - span(p, T.colour[0] + 0.06, T.colour[1])).toFixed(3)
      const sd = easeInOut(span(p, T.scrollDown[0], T.scrollDown[1])) - easeInOut(span(p, T.scrollUp[0], T.scrollUp[1]))
      page.style.transform = `translate3d(0, ${(-27 * sd).toFixed(2)}%, 0)`

      // 4. the address types, the cursor presses the button, the site is live
      const n = Math.round(URL_TEXT.length * span(p, T.type[0], T.type[1]))
      if (typed.textContent!.length !== n) typed.textContent = URL_TEXT.slice(0, n)
      caret.style.opacity = p > T.type[0] - 0.02 && p < T.live[1] ? '1' : '0'
      const k = easeInOut(span(p, T.cursor[0], T.cursor[1]))
      const cv = span(p, T.cursor[0] - 0.02, T.cursor[0]) * (1 - span(p, 0.97, 1))
      cursor.style.opacity = cv.toFixed(3)
      cursor.style.left = `${(58 + (82 - 58) * k).toFixed(2)}%`
      cursor.style.top = `${(86 + (42 - 86) * k).toFixed(2)}%`
      const press = span(p, T.click[0], T.click[1])
      const down = press > 0 && press < 1
      cta.classList.toggle('is-pressed', down)
      cursor.style.transform = `translate(-20%, -10%) scale(${down ? 0.86 : 1})`
      ripple.style.opacity = (press > 0 ? 1 - press : 0).toFixed(3)
      ripple.style.transform = `translate(-50%, -50%) scale(${(0.2 + press * 2.4).toFixed(3)})`
      live.style.opacity = ease(span(p, T.live[0], T.live[1])).toFixed(3)

      // the copy: one step at a time, and the rail fills
      const cur = p >= STEP_AT[3] ? 3 : p >= STEP_AT[2] ? 2 : p >= STEP_AT[1] ? 1 : 0
      if (cur !== active) {
        steps.forEach((s, i) => { s.classList.toggle('is-active', i === cur); s.classList.toggle('is-past', i < cur) })
        labels.forEach((s, i) => { s.classList.toggle('is-active', i === cur); s.classList.toggle('is-done', i < cur) })
        active = cur
      }
      fill.style.transform = `scaleX(${clamp01(p / 0.93).toFixed(4)})`

      stage.setAttribute('data-sc-verify-state', `${cur}/${l.toFixed(2)}/${c.toFixed(2)}/${sd.toFixed(2)}/${n}/${k.toFixed(2)}`)
      stage.setAttribute('data-sc-verify-hold', p > 0.93 && p < 1 ? 'true' : 'false')
    }

    // Own progress rather than the act's: it starts while the section is still
    // sliding in, so the laptop is already opening as the pin takes hold.
    const progress = () => {
      const r = sec.getBoundingClientRect()
      const lead = innerHeight * 0.6
      const travel = Math.max(sec.offsetHeight - innerHeight, 1)
      return clamp01((lead - r.top) / (travel + lead))
    }

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const p = progress()
      if (p === last) return
      last = p
      if (reduce) {
        // Fewer and gentler: the finished, live site; the copy advances by opacity.
        const cur = p >= STEP_AT[3] ? 3 : p >= STEP_AT[2] ? 2 : p >= STEP_AT[1] ? 1 : 0
        steps.forEach((s, i) => s.classList.toggle('is-active', i === cur))
        labels.forEach((s, i) => s.classList.toggle('is-active', i === cur))
        return
      }
      paint(p)
    }
    paint(reduce ? 1 : 0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return null
}
