import { gsap } from 'gsap'

// Project dialogs (native <dialog>: focus trap, Escape and focus return come
// from the platform), plus depth in the gallery: the phone drifts at its own
// rate, and a captured screenshot scrolls inside its frame.
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
  if (!reduced) {
    mm.add('(min-width: 1024px)', () => {
      document.querySelectorAll<HTMLElement>('#work .project').forEach(p => {
        const phone = p.querySelector('.device-phone')
        if (phone) gsap.fromTo(phone, { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    })
    document.querySelectorAll<HTMLElement>('#work .project').forEach(p => {
      const screen = p.querySelector<HTMLElement>('[data-parallax-screen]')
      const shot = screen?.querySelector<HTMLElement>('.shot')
      if (!screen || !shot) return
      gsap.to(shot, {
        y: () => -Math.max(shot.offsetHeight - screen.clientHeight, 0) * 0.6, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 20%', scrub: true, invalidateOnRefresh: true },
      })
    })
  }

  return () => {
    opens.forEach(b => b.removeEventListener('click', onOpen))
    dialogs.forEach(d => { d.removeEventListener('click', onDialogClick); d.removeEventListener('close', onClose); if (d.open) d.close() })
    mm.revert()
  }
}
