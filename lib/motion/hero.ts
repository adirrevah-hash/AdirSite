import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Hero3D } from './hero3d'

// Mounts the WebGL object once the page is idle, crossfades it over the CSS
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

  const copyTween = reduced ? null : gsap.to('.hero__inner', {
    yPercent: -10, opacity: 0.15, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  })

  const idle = (cb: () => void) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 300))
  // Phones get the WebGL object only when they have the headroom for it;
  // weaker or data-saving devices keep the CSS rendition and their battery.
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const small = matchMedia('(max-width: 767px)').matches
  const capable = !nav.connection?.saveData && (!small || ((nav.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4))
  if (capable) idle(() => {
    import('./hero3d').then(m => {
      if (disposed || !m.webglAvailable()) return
      try {
        const t = m.mountHero3D(canvas, { reduced, fins: small ? 13 : 15 })
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
    copyTween?.scrollTrigger?.kill()
    copyTween?.kill()
    three?.dispose()
    hero.classList.remove('is-3d')
  }
}
