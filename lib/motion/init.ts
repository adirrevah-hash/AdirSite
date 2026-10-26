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
import { initA11y, motionStopped } from './a11y'
import { initCookies } from './cookies'

gsap.registerPlugin(ScrollTrigger)
// A phone's address bar showing or hiding changes the viewport height; that
// must not re-measure every trigger mid-scroll, which makes pinned rows jump.
ScrollTrigger.config({ ignoreMobileResize: true })

// One entry point for every interaction on the page. The accessibility panel
// and the cookie notice live for the whole visit; the rest restarts in reduced mode (or back) when
// the visitor stops or resumes motion from it.
export function initSite() {
  let stop = startSite()
  const a11y = initA11y(() => { stop(); window.scrollTo(0, window.scrollY); stop = startSite() })
  const cookies = initCookies()
  return () => { cookies(); a11y(); stop() }
}

// Each module returns its own cleanup; this returns one that runs them all.
function startSite() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || motionStopped()
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
    initForm(),
    initFloat(),
  ]
  // The chapters further down set up once the first screen is interactive,
  // one module per idle moment, so no single task holds up a phone's main
  // thread for long.
  const steps = [
    () => initWork(reduced),
    () => initServices(reduced),
    () => initDifference(reduced),
    () => initProcess(reduced),
    () => initMagnetic(reduced),
    () => initStory(reduced),
    () => initCursor(reduced),
    () => initDrafting(reduced),
    () => initForms(reduced),
  ]
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
  let later = 0
  let ready = false
  const step = () => {
    later = 0
    cleanups.push(steps.shift()!())
    if (steps.length) { later = idle(step, { timeout: 1500 }); return }
    // Pinned chapters add scroll distance, so every trigger has to be
    // measured in page order, whichever module created it.
    ready = true
    ScrollTrigger.sort()
    ScrollTrigger.refresh()
  }
  later = idle(step, { timeout: 1500 })
  // Layout settles once the fonts are in; measure the triggers again then,
  // unless the chapters below have not all set up yet (the last one measures).
  document.fonts?.ready.then(() => { if (ready) ScrollTrigger.refresh() })
  return () => {
    if (later) cancelIdle(later)
    cleanups.forEach(c => c?.())
    ScrollTrigger.getAll().forEach(t => t.kill())
  }
}
