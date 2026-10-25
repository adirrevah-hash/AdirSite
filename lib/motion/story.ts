import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The scroll-driven chapters between the sections: the statement that fills
// word by word, the marquee, the louvre that closes into the final statement,
// the footer wordmark, and the reading progress line. None of it runs for
// reduced motion; the content is already complete without it.
export function initStory(reduced: boolean) {
  if (reduced) return () => {}
  const stops: Array<() => void> = []

  const ctx = gsap.context(() => {
    // Philosophy: each word comes up to full ink as the statement passes
    // through the screen. No pin: the page keeps its normal pace.
    const pin = document.querySelector<HTMLElement>('[data-fill-pin]')
    if (pin) {
      const ink = getComputedStyle(pin.querySelector('[data-fill]')!).color
      gsap.timeline({ scrollTrigger: { trigger: pin, start: 'top 85%', end: 'bottom 40%', scrub: 0.5 } })
        .to(pin.querySelectorAll('[data-fill] .c'), { color: ink, ease: 'none', stagger: 0.12, duration: 0.3 })
    }

    // Marquee: a steady drift that the reader's scroll speed pushes along.
    const rows = gsap.utils.toArray<HTMLElement>('[data-marquee]')
    if (rows.length) {
      const state = rows.map(row => ({ row, dir: Number(row.dataset.marquee), x: 0, width: (row.firstElementChild as HTMLElement).offsetWidth }))
      let boost = 0
      let skew = 0
      let visible = false
      const setSkew = rows.map(r => gsap.quickSetter(r, 'skewX', 'deg'))
      ScrollTrigger.create({
        trigger: '.marquee', start: 'top bottom', end: 'bottom top',
        onToggle: self => { visible = self.isActive },
        onUpdate: self => {
          const v = self.getVelocity()
          boost = Math.min(Math.abs(v) / 120, 14)
          skew = gsap.utils.clamp(-8, 8, v / -300)
        },
      })
      const tick = (_t: number, dt: number) => {
        if (!visible) return
        boost *= 0.94
        skew *= 0.9
        state.forEach((s, i) => {
          s.x -= s.dir * (0.45 + boost) * (dt / 16.7)
          if (s.x <= -s.width) s.x += s.width
          if (s.x > 0) s.x -= s.width
          gsap.set(s.row, { x: s.x })
          setSkew[i](skew * s.dir)
        })
      }
      gsap.ticker.add(tick)
      const onResize = () => state.forEach(s => { s.width = (s.row.firstElementChild as HTMLElement).offsetWidth })
      window.addEventListener('resize', onResize)
      stops.push(() => { gsap.ticker.remove(tick); window.removeEventListener('resize', onResize) })
    }

    // The louvre closes over the light chapter, bar by bar.
    const shutter = document.querySelector<HTMLElement>('[data-shutter]')
    if (shutter) {
      gsap.fromTo(shutter.children, { scaleY: 0 }, {
        scaleY: 1, ease: 'none', stagger: 0.08,
        scrollTrigger: { trigger: shutter, start: 'top 92%', end: 'bottom 55%', scrub: 0.4 },
      })
    }

    // The final statement arrives from very close and settles.
    const stage = document.querySelector<HTMLElement>('[data-statement-pin]')
    const title = stage?.querySelector<HTMLElement>('[data-zoom]')
    if (stage && title) {
      const cta = stage.querySelector('[data-statement-cta]')
      gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=110%', pin: true, scrub: 0.6 } })
        .fromTo(title, { scale: 3.2, opacity: 0, filter: 'blur(14px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 1 })
        .fromTo(title.querySelectorAll('.statement__line'), { yPercent: 55 }, { yPercent: 0, ease: 'power2.out', stagger: 0.12, duration: 0.8 }, 0)
        .fromTo(cta, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, 0.85)
    }

    // Footer wordmark: letters rise at their own pace as the page ends.
    const word = document.querySelector<HTMLElement>('[data-footer-word]')
    if (word) {
      gsap.fromTo(word.children, { yPercent: 100 }, {
        yPercent: 0, ease: 'none', stagger: 0.06,
        scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom 75%', scrub: 0.6 },
      })
    }

    // Reading progress along the top edge.
    const bar = document.createElement('div')
    bar.className = 'progress'
    bar.setAttribute('aria-hidden', 'true')
    document.body.appendChild(bar)
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })
    stops.push(() => bar.remove())
  })

  return () => { stops.forEach(f => f()); ctx.revert() }
}

// A ring that follows the pointer on desktop. It swells over anything
// clickable and becomes a label over the projects. The system cursor stays.
export function initCursor(reduced: boolean) {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  const el = document.createElement('div')
  el.className = 'cursor'
  el.setAttribute('aria-hidden', 'true')
  const label = document.createElement('span')
  label.className = 'cursor__label'
  el.appendChild(label)
  document.body.appendChild(el)

  const x = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
  const y = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    x(e.clientX); y(e.clientY)
    el.classList.add('is-on')
  }
  const onOver = (e: PointerEvent) => {
    const t = e.target as Element
    const tagged = t.closest<HTMLElement>('[data-cursor]')
    el.classList.toggle('is-label', !!tagged)
    if (tagged) label.textContent = tagged.dataset.cursor ?? ''
    el.classList.toggle('is-link', !tagged && !!t.closest('a, button, select, input, textarea, label'))
  }
  const onLeave = () => el.classList.remove('is-on')
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver)
  document.documentElement.addEventListener('pointerleave', onLeave)
  return () => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerover', onOver)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    el.remove()
  }
}
