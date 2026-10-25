import { gsap } from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'

// Project dialogs (native <dialog>: focus trap, Escape and focus return come
// from the platform), and the gallery's movement: sideways on wide screens,
// with each project turning to face the reader as it arrives.
export function initWork(reduced: boolean) {
  const opens = [...document.querySelectorAll<HTMLElement>('[data-dialog]')]
  const onOpen = (e: Event) => {
    const id = (e.currentTarget as HTMLElement).dataset.dialog!
    const dlg = document.getElementById(id) as HTMLDialogElement | null
    if (dlg && !dlg.open) { dlg.showModal(); document.documentElement.style.overflow = 'hidden' }
  }
  const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog.pdialog')]
  const onDialogClick = (e: MouseEvent) => {
    const dlg = e.currentTarget as HTMLDialogElement
    if (e.target === dlg || (e.target as Element).closest('[data-dialog-close]')) dlg.close()
  }
  const onClose = () => { document.documentElement.style.overflow = '' }
  opens.forEach(b => b.addEventListener('click', onOpen))
  dialogs.forEach(d => { d.addEventListener('click', onDialogClick); d.addEventListener('close', onClose) })

  const mm = gsap.matchMedia()
  const section = document.querySelector<HTMLElement>('[data-work]')
  const pin = section?.querySelector<HTMLElement>('[data-work-pin]')
  const track = section?.querySelector<HTMLElement>('[data-work-track]')
  const projects = [...document.querySelectorAll<HTMLElement>('[data-project]')]

  // A captured screenshot scrolls inside its frame while the project passes.
  const scrollShot = (p: HTMLElement, trigger: ScrollTrigger.Vars) => {
    const screen = p.querySelector<HTMLElement>('[data-parallax-screen]')
    const shot = screen?.querySelector<HTMLElement>('.shot')
    if (!screen || !shot) return
    gsap.to(shot, { y: () => -Math.max(shot.offsetHeight - screen.clientHeight, 0) * 0.6, ease: 'none', scrollTrigger: { ...trigger, scrub: true, invalidateOnRefresh: true } })
  }

  if (!reduced && section && pin && track) {
    // Wide screens: the gallery holds and the projects travel sideways. In
    // RTL the row runs leftward, so the track moves right to bring it in.
    mm.add('(min-width: 1024px)', () => {
      section.classList.add('is-h')
      // The pin is CSS sticky (smooth, and no layout shift); the section is
      // lengthened by exactly the distance the track travels.
      const marquee = section.querySelector<HTMLElement>('.marquee')
      const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0)
      const setRoom = () => section.style.setProperty('--travel', distance() + 'px')
      setRoom()
      const startAt = () => (marquee ? marquee.getBoundingClientRect().bottom + window.scrollY : section.getBoundingClientRect().top + window.scrollY)
      const travel = gsap.to(track, {
        x: () => distance(), ease: 'none',
        scrollTrigger: { start: startAt, end: () => startAt() + distance(), scrub: 0.7, invalidateOnRefresh: true, onRefreshInit: setRoom },
      })
      projects.forEach(p => {
        const devices = p.querySelector('.devices')
        const phone = p.querySelector('.device-phone')
        const index = p.querySelector('.project__index')
        const along = { trigger: p, containerAnimation: travel }
        gsap.fromTo(devices, { rotateY: 22, scale: 0.86, transformPerspective: 1600 }, { rotateY: 0, scale: 1, ease: 'none', scrollTrigger: { ...along, start: 'right left', end: 'center 55%', scrub: true } })
        if (phone) gsap.fromTo(phone, { xPercent: -40 }, { xPercent: 0, ease: 'none', scrollTrigger: { ...along, start: 'right left', end: 'center 55%', scrub: true } })
        if (index) gsap.fromTo(index, { xPercent: -60 }, { xPercent: 60, ease: 'none', scrollTrigger: { ...along, start: 'right left', end: 'left right', scrub: true } })
        scrollShot(p, { ...along, start: 'right left', end: 'left right' })
      })
      // Keyboard focus can land on a project that is still off to the side:
      // move the page to the point where that project is centred.
      const st = travel.scrollTrigger!
      const onFocus = (e: FocusEvent) => {
        const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-project], .work__head')
        const dist = distance()
        if (!panel || !dist) return
        const r = panel.getBoundingClientRect()
        const x = gsap.getProperty(track, 'x') as number
        const want = gsap.utils.clamp(0, dist, x + (window.innerWidth / 2 - (r.left + r.width / 2)))
        travel.progress(want / dist)
        window.scrollTo({ top: st.start + (want / dist) * (st.end - st.start), behavior: 'instant' })
      }
      track.addEventListener('focusin', onFocus)
      return () => { track.removeEventListener('focusin', onFocus); section.classList.remove('is-h'); section.style.removeProperty('--travel') }
    })
    // Narrower screens: projects stack and lift in as they arrive.
    mm.add('(max-width: 1023px)', () => {
      projects.forEach(p => {
        gsap.fromTo(p.querySelector('.devices'), { y: 60, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } })
        scrollShot(p, { trigger: p, start: 'top 80%', end: 'bottom 20%' })
      })
    })
  }

  return () => {
    opens.forEach(b => b.removeEventListener('click', onOpen))
    dialogs.forEach(d => { d.removeEventListener('click', onDialogClick); d.removeEventListener('close', onClose); if (d.open) d.close() })
    mm.revert()
  }
}
