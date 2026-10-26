import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The motion vocabulary, shared by every section:
//   chars  headings rise letter by letter out of their line masks
//   lines  plain lines rise out of a mask
//   fade   a group's children lift in, staggered
//   mask   a block opens from below with a clipped edge
// Section labels decode from scrambled letters as they arrive.
// Content is fully visible until this runs, and it never runs for reduced
// motion, so nothing depends on it to be read.
const EASE = 'expo.out'
const POOL = 'אבגדהוזחטיכלמנסעפצקרשת'

// Each reveal is registered on its own: those in the first screen at once,
// the rest a few at a time in idle moments, long before the reader scrolls to
// them. Registering them all in one go held a phone's main thread for a
// third of a second at load.
type Reveal = { el: HTMLElement; add: () => void }

export function initReveals(reduced: boolean) {
  if (reduced) return () => {}
  const frames = new Set<number>()
  const finals = new Map<HTMLElement, string>()
  const reveals: Reveal[] = []
  const each = (selector: string, add: (el: HTMLElement) => void) =>
    gsap.utils.toArray<HTMLElement>(selector).forEach(el => reveals.push({ el, add: () => add(el) }))

  each('[data-reveal="chars"]', el => {
    gsap.fromTo(el.querySelectorAll('.c'), { yPercent: 118, rotate: 9 }, {
      yPercent: 0, rotate: 0, duration: 1.15, ease: EASE, stagger: 0.024,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    })
  })
  each('[data-reveal="lines"]', el => {
    gsap.fromTo(el.querySelectorAll('.line > span'), { yPercent: 108 }, {
      yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    })
  })
  each('[data-reveal="fade"]', el => {
    gsap.fromTo(el.children, { y: 36, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })
  each('[data-reveal="mask"]', el => {
    gsap.fromTo(el, { clipPath: 'inset(14% 0% 0% 0% round 18px)', y: 50, opacity: 0.001 }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', y: 0, opacity: 1, duration: 1.4, ease: EASE,
      clearProps: 'clipPath',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })

  // What sits in or near the first screen is measured now, before any of it
  // moves; everything else waits its turn.
  const fold = innerHeight * 1.25
  const near = new Set(reveals.filter(r => r.el.getBoundingClientRect().top < fold))
  const queue = reveals.filter(r => !near.has(r))
  const idle = window.requestIdleCallback ?? ((cb: (d: IdleDeadline) => void) => window.setTimeout(() => cb({ timeRemaining: () => 8, didTimeout: true } as IdleDeadline), 16))
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
  let pending = 0

  const ctx = gsap.context(() => {
    document.documentElement.classList.add('motion-ready')
    near.forEach(r => r.add())

    // Labels outside the hero decode once, left to right in reading order.
    gsap.utils.toArray<HTMLElement>('main .t-label').forEach(el => {
      if (el.closest('.hero')) return
      const final = el.textContent ?? ''
      finals.set(el, final)
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => decode(el, final, frames) })
    })

    // The light chapter after the hero widens out of the dark one.
    const philo = document.querySelector<HTMLElement>('[data-philo]')
    if (philo) {
      gsap.fromTo(philo, { clipPath: 'inset(0% 3.5% 0% 3.5% round 28px 28px 0px 0px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 22px 22px 0px 0px)', ease: 'none',
        scrollTrigger: { trigger: philo, start: 'top bottom', end: 'top 35%', scrub: true },
      })
    }
  })

  const drain = (d: IdleDeadline) => {
    pending = 0
    ctx.add(() => { do queue.shift()!.add(); while (queue.length && d.timeRemaining() > 6) })
    if (queue.length) pending = idle(drain, { timeout: 600 })
    else ScrollTrigger.refresh()
  }
  if (queue.length) pending = idle(drain, { timeout: 600 })

  return () => {
    if (pending) cancelIdle(pending)
    frames.forEach(cancelAnimationFrame)
    finals.forEach((text, el) => { el.textContent = text })
    ctx.revert()
    document.documentElement.classList.remove('motion-ready')
  }
}

function decode(el: HTMLElement, final: string, frames: Set<number>) {
  const start = performance.now()
  const DURATION = 700
  const tick = (now: number) => {
    const p = Math.min((now - start) / DURATION, 1)
    const shown = Math.floor(p * final.length)
    el.textContent = [...final].map((ch, i) => (i < shown || ch === ' ' ? ch : POOL[(Math.random() * POOL.length) | 0])).join('')
    if (p < 1) frames.add(requestAnimationFrame(tick))
    else el.textContent = final
  }
  frames.add(requestAnimationFrame(tick))
}
