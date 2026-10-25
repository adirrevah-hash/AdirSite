import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Hero3D } from './hero3d'
import { afterSettle } from './settle'

// Mounts the WebGL object once the page has settled, crossfades it over the CSS
// rendition, and ties its alignment to how far the hero has scrolled away.
// Without WebGL the CSS rendition simply stays.
export function initHero(reduced: boolean) {
  const hero = document.querySelector<HTMLElement>('[data-hero]')
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]')
  if (!hero || !canvas) return () => {}

  let three: Hero3D | null = null
  let disposed = false
  let progress = 0

  const st = ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom top',
    onUpdate: self => { progress = self.progress; three?.setProgress(progress * 0.95) },
  })

  // As the hero scrolls away its headline comes apart word by word and the
  // copy under it lifts off, leaving the object to finish its turn.
  let scatter: gsap.core.Timeline | null = null
  if (!reduced) {
    scatter = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } })
    hero.querySelectorAll<HTMLElement>('.hero__title .w').forEach((w, i) => {
      scatter!.to(w, { yPercent: -gsap.utils.random(90, 260), xPercent: gsap.utils.random(-25, 25), rotate: gsap.utils.random(-12, 12), opacity: 0, ease: 'power1.in' }, i * 0.04)
    })
    // The copy fades as one block. Its parts carry the intro's CSS fade, so
    // the scrub works on their wrapper rather than fight over the same element.
    scatter.fromTo('.hero__inner', { y: 0, opacity: 1 }, { y: -60, opacity: 0, ease: 'power1.in', immediateRender: false }, 0.1)
  }

  // Phones get the WebGL object only when they have the headroom for it;
  // weaker or data-saving devices keep the CSS rendition and their battery.
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const small = matchMedia('(max-width: 767px)').matches
  const capable = !nav.connection?.saveData && (!small || ((nav.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4))
  if (capable) afterSettle().then(() => {
    import('./hero3d').then(m => {
      if (disposed || !m.webglAvailable()) return
      try {
        const t = m.mountHero3D(canvas, { reduced, compact: small })
        three = t
        t.setProgress(progress * 0.95)
        t.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => { if (!disposed) hero.classList.add('is-3d') })))
      } catch {
        three = null // keep the CSS rendition
      }
    })
  })

  return () => {
    disposed = true
    st.kill()
    scatter?.scrollTrigger?.kill()
    scatter?.revert()
    three?.dispose()
    hero.classList.remove('is-3d')
  }
}
