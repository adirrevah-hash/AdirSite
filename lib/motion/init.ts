import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initHeader } from './header'
import { initReveals } from './reveals'
import { initHero } from './hero'
import { initWork } from './work'
import { initServices } from './services'
import { initProcess } from './process'
import { initForm } from './form'
import { initFloat } from './float'
import { initMagnetic } from './magnetic'

gsap.registerPlugin(ScrollTrigger)

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
    initWork(reduced),
    initServices(reduced),
    initProcess(reduced),
    initForm(opts.endpoint),
    initFloat(),
    initMagnetic(reduced),
  ]
  // Layout settles once the fonts are in; measure the triggers again then.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
  return () => {
    cleanups.forEach(c => c?.())
    ScrollTrigger.getAll().forEach(t => t.kill())
  }
}
