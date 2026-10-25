import { gsap } from 'gsap'

// The motion vocabulary, shared by every section:
//   lines  headings rise line by line out of a mask
//   fade   a group's children lift in, staggered
//   mask   a block opens from below with a clipped edge
// Content is fully visible until this runs, and it never runs for reduced
// motion, so nothing depends on it to be read.
const EASE = 'expo.out'

export function initReveals(reduced: boolean) {
  if (reduced) return () => {}
  const ctx = gsap.context(() => {
    document.documentElement.classList.add('motion-ready')

    gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach(el => {
      gsap.fromTo(el.querySelectorAll('.line > span'), { yPercent: 108 }, {
        yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach(el => {
      gsap.fromTo(el.children, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.08,
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

    // The light chapter after the hero widens out of the dark one.
    const philo = document.querySelector<HTMLElement>('[data-philo]')
    if (philo) {
      gsap.fromTo(philo, { clipPath: 'inset(0% 3.5% 0% 3.5% round 28px 28px 0px 0px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 22px 22px 0px 0px)', ease: 'none',
        scrollTrigger: { trigger: philo, start: 'top bottom', end: 'top 35%', scrub: true },
      })
    }
  })
  return () => { ctx.revert(); document.documentElement.classList.remove('motion-ready') }
}
