import { gsap } from 'gsap'

// As the hero scrolls away its headline comes apart word by word, the copy
// lifts off, and the desk scene drifts at its own, slower pace.
export function initHero(reduced: boolean) {
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  if (!hero || reduced) return () => {}
  const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } })
  hero.querySelectorAll<HTMLElement>('.hero__title .w').forEach((w, i) => {
    tl.to(w, { yPercent: -gsap.utils.random(90, 260), xPercent: gsap.utils.random(-25, 25), rotate: gsap.utils.random(-12, 12), opacity: 0, ease: 'power1.in' }, i * 0.04)
  })
  // The copy fades as one block. Its parts carry the intro's CSS fade, so the
  // scrub works on their wrapper rather than fight over the same element.
  tl.fromTo('.hero__inner', { y: 0, opacity: 1 }, { y: -60, opacity: 0, ease: 'power1.in', immediateRender: false }, 0.1)
  tl.fromTo('[data-hero-art] .hero__scene', { yPercent: 0, scale: 1 }, { yPercent: 8, scale: 1.06, ease: 'none', immediateRender: false }, 0)
  return () => { tl.scrollTrigger?.kill(); tl.revert() }
}
