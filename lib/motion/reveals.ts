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

export function initReveals(reduced: boolean) {
  if (reduced) return () => {}
  const frames = new Set<number>()
  const finals = new Map<HTMLElement, string>()
  const ctx = gsap.context(() => {
    document.documentElement.classList.add('motion-ready')

    gsap.utils.toArray<HTMLElement>('[data-reveal="chars"]').forEach(el => {
      gsap.fromTo(el.querySelectorAll('.c'), { yPercent: 118, rotate: 9 }, {
        yPercent: 0, rotate: 0, duration: 1.15, ease: EASE, stagger: 0.024,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach(el => {
      gsap.fromTo(el.querySelectorAll('.line > span'), { yPercent: 108 }, {
        yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach(el => {
      gsap.fromTo(el.children, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-reveal="mask"]').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(14% 0% 0% 0% round 18px)', y: 50, opacity: 0.001 }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', y: 0, opacity: 1, duration: 1.4, ease: EASE,
        clearProps: 'clipPath',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    })

    // The founder's portrait rises into place and its photo settles from a
    // touch closer. Opacity and transform only.
    gsap.utils.toArray<HTMLElement>('[data-about-portrait]').forEach(el => {
      const st = { trigger: el, start: 'top 85%', once: true }
      gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.3, ease: EASE, scrollTrigger: st })
      gsap.fromTo(el.querySelector('.about__img'), { scale: 1.08 }, { scale: 1, duration: 1.8, ease: EASE, scrollTrigger: st })
    })

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
  return () => {
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
