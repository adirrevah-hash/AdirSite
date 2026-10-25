import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Forms3D } from './forms3d'
import { afterSettle } from './settle'

// Mounts the approach section's 3D sculpture shortly before it scrolls into
// view (and not before the page has settled) and ties its assembly to the reader's progress through the statement.
// Phones without the headroom, and browsers without WebGL, keep the CSS forms.
export function initForms(reduced: boolean) {
  const scene = document.querySelector<HTMLElement>('[data-forms]')
  const canvas = scene?.querySelector<HTMLCanvasElement>('[data-forms-canvas]')
  const top = document.querySelector<HTMLElement>('.philo__top')
  if (!scene || !canvas || !top) return () => {}

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const small = matchMedia('(max-width: 767px)').matches
  const capable = !nav.connection?.saveData && (!small || ((nav.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4))
  if (!capable) return () => {}

  let forms: Forms3D | null = null
  let disposed = false
  let progress = reduced ? 1 : 0
  const st = reduced ? null : ScrollTrigger.create({
    trigger: top, start: 'top 85%', end: 'bottom 35%',
    onUpdate: self => { progress = self.progress; forms?.setProgress(progress) },
  })

  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io.disconnect()
    Promise.all([import('./forms3d'), import('./hero3d'), afterSettle()]).then(([m, h]) => {
      if (disposed || !h.webglAvailable()) return
      try {
        const f = m.mountForms3D(canvas, { reduced })
        forms = f
        f.setProgress(progress)
        f.ready.then(() => { if (!disposed) { f.setProgress(progress); scene.classList.add('is-3d') } })
      } catch {
        forms = null // keep the CSS forms
      }
    })
  }, { rootMargin: '600px 0px' })
  io.observe(scene)

  return () => {
    disposed = true
    io.disconnect()
    st?.kill()
    forms?.dispose()
    scene.classList.remove('is-3d')
  }
}
