import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initHeader } from './header'
import { initReveals } from './reveals'
import { initHero, initRotator } from './hero'
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

// One entry point for every interaction on the page. Each module returns its
// own cleanup; this returns one that runs them all.
export function initSite() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  // The page only ever scrolls vertically. Nothing should push it sideways,
  // but if anything does (a phone returning from another app, a focus jump),
  // put it straight back.
  const keepUpright = () => { if (window.scrollX !== 0) window.scrollTo(0, window.scrollY) }
  addEventListener('scroll', keepUpright, { passive: true })
  document.addEventListener('visibilitychange', keepUpright)
  const cleanups = [
    () => { removeEventListener('scroll', keepUpright); document.removeEventListener('visibilitychange', keepUpright) },
    initHeader(),
    initReveals(reduced),
    initHero(reduced),
    initRotator(reduced),
    initForm(),
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
  // Layout settles once the fonts are in; measure the triggers again then,
  // unless the chapters below have not set up yet (their setup measures).
  document.fonts?.ready.then(() => { if (!later) ScrollTrigger.refresh() })
  return () => {
    if (later) cancelIdle(later)
    cleanups.forEach(c => c?.())
    ScrollTrigger.getAll().forEach(t => t.kill())
  }
}
