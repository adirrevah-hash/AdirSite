import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initHeader } from './header'
import { initReveals } from './reveals'
import { initHero } from './hero'
import { initWork } from './work'
import { initServices } from './services'
import { initDifference } from './difference'
import { initProcess } from './process'
import { initForm } from './form'
import { initFloat } from './float'
import { initMagnetic } from './magnetic'
import { initCursor, initStory } from './story'
import { initDrafting } from './drafting'
import { initForms } from './forms'

gsap.registerPlugin(ScrollTrigger)
// A phone's address bar showing or hiding changes the viewport height; that
// must not re-measure every trigger mid-scroll, which makes pinned rows jump.
ScrollTrigger.config({ ignoreMobileResize: true })

export type SiteOptions = {
  // Where the lead form posts. null in the static preview, where there is no
  // server: the form then completes on WhatsApp and says so.
  endpoint: string | null
}

// One entry point for every interaction on the page. Each module returns its
// own cleanup; this returns one that runs them all.
export function initSite(opts: SiteOptions) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = [
    initHeader(),
    initReveals(reduced),
    initHero(reduced),
    initForm(opts.endpoint),
    initFloat(),
  ]
  // The chapters further down set up once the first screen is interactive,
  // which keeps the main thread free while the page is loading.
  let later = 0
  const rest = () => {
    later = 0
    cleanups.push(
      initWork(reduced),
      initServices(reduced),
      initDifference(reduced),
      initProcess(reduced),
      initMagnetic(reduced),
      initStory(reduced),
      initCursor(reduced),
      initDrafting(reduced),
      initForms(reduced),
    )
    // Pinned chapters add scroll distance, so every trigger has to be
    // measured in page order, whichever module created it.
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  }
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
  later = idle(rest, { timeout: 1500 })
  // Layout settles once the fonts are in; measure the triggers again then.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  return () => {
    if (later) cancelIdle(later)
    cleanups.forEach(c => c?.())
    ScrollTrigger.getAll().forEach(t => t.kill())
  }
}
