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

// The hero's second line turns through its words, letter by letter, while the
// hero is on screen. Reduced motion keeps the first word and its rule.
export function initRotator(reduced: boolean) {
  const rot = document.querySelector<HTMLElement>('[data-rotator]')
  if (!rot) return () => {}
  const words = [...rot.querySelectorAll<HTMLElement>('.hero__word')]
  const rule = rot.querySelector<HTMLElement>('[data-underline]')
  const measure = (w: HTMLElement) => rule?.style.setProperty('--uw', `${w.querySelector('.split')!.getBoundingClientRect().width}px`)
  let i = 0
  measure(words[0])
  const onResize = () => measure(words[i])
  addEventListener('resize', onResize)
  if (reduced || words.length < 2) return () => removeEventListener('resize', onResize)

  let timer = 0
  let visible = true
  const next = () => {
    if (!visible || document.hidden) return
    const cur = words[i]
    i = (i + 1) % words.length
    const nxt = words[i]
    cur.classList.replace('is-on', 'is-out')
    nxt.classList.add('is-on')
    measure(nxt)
    gsap.to(cur.querySelectorAll('.c'), {
      yPercent: -115, duration: 0.45, ease: 'power3.in', stagger: 0.018, overwrite: true,
      onComplete: () => { cur.classList.remove('is-out'); gsap.set(cur.querySelectorAll('.c'), { clearProps: 'transform' }) },
    })
    gsap.fromTo(nxt.querySelectorAll('.c'), { yPercent: 115 }, { yPercent: 0, duration: 0.75, ease: 'expo.out', stagger: 0.022, delay: 0.22, overwrite: true })
    if (rule) gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out', delay: 0.3, overwrite: true })
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
  io.observe(rot)
  // Start once the opening has played, then turn every few seconds.
  const start = window.setTimeout(() => { timer = window.setInterval(next, 2800) }, document.documentElement.classList.contains('has-intro') ? 4200 : 2600)
  return () => {
    clearTimeout(start); clearInterval(timer); io.disconnect()
    removeEventListener('resize', onResize)
    gsap.killTweensOf([rule, ...words.flatMap(w => [...w.querySelectorAll('.c')])])
  }
}
