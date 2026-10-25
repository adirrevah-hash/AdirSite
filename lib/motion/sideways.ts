import { gsap } from 'gsap'

// Sideways travel, shared by the gallery and the services. The room is
// lengthened by exactly the distance the track travels, and the pin inside it
// is CSS sticky (smooth, and no layout shift). In RTL the row runs leftward,
// so the track moves right to bring it in.
// Markup: .x-room > .x-pin > .x-track > panels
export function sideways(room: HTMLElement, panels: string, onProgress?: (p: number) => void) {
  const track = room.querySelector<HTMLElement>('.x-track')!
  room.classList.add('is-h')
  const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0)
  const setRoom = () => room.style.setProperty('--travel', distance() + 'px')
  setRoom()
  const startAt = () => room.getBoundingClientRect().top + window.scrollY
  // Touch scrolling already has momentum; a shorter catch-up keeps the row
  // under the finger instead of trailing behind it.
  const touch = matchMedia('(hover: none), (pointer: coarse)').matches
  const travel = gsap.to(track, {
    x: () => distance(), ease: 'none', force3D: true,
    scrollTrigger: { start: startAt, end: () => startAt() + distance(), scrub: touch ? 0.25 : 0.7, invalidateOnRefresh: true, onRefreshInit: setRoom, onUpdate: self => onProgress?.(self.progress) },
  })

  // Keyboard focus can land on a panel that is still off to the side: move
  // the page to the point where that panel is centred.
  const st = travel.scrollTrigger!
  const onFocus = (e: FocusEvent) => {
    const panel = (e.target as HTMLElement).closest<HTMLElement>(panels)
    const dist = distance()
    if (!panel || !dist) return
    const r = panel.getBoundingClientRect()
    const x = gsap.getProperty(track, 'x') as number
    const want = gsap.utils.clamp(0, dist, x + (window.innerWidth / 2 - (r.left + r.width / 2)))
    travel.progress(want / dist)
    window.scrollTo({ top: st.start + (want / dist) * (st.end - st.start), behavior: 'instant' })
  }
  track.addEventListener('focusin', onFocus)

  const done = () => {
    track.removeEventListener('focusin', onFocus)
    room.classList.remove('is-h')
    room.style.removeProperty('--travel')
  }
  return { travel, done }
}

// A row of cards on the sideways travel: each card lifts in as it arrives,
// a meter ([data-row-count], [data-row-bar]) counts them, and an outlined
// word ([data-ghost]) drifts the other way. Used by services and difference.
export function cardRow(room: HTMLElement, items: HTMLElement[], panels: string) {
  const count = room.querySelector<HTMLElement>('[data-row-count]')
  const bar = room.querySelector<HTMLElement>('[data-row-bar]')
  const ghost = room.querySelector<HTMLElement>('[data-ghost]')
  const { travel, done } = sideways(room, panels, p => {
    if (bar) gsap.set(bar, { scaleX: p })
    if (count) count.textContent = String(Math.min(items.length, Math.floor(p * items.length) + 1)).padStart(2, '0')
  })
  const st = travel.scrollTrigger!
  if (ghost) gsap.fromTo(ghost, { xPercent: 12 }, { xPercent: -30, ease: 'none', scrollTrigger: { start: () => st.start, end: () => st.end, scrub: 0.7 } })
  // Cards lift in as they arrive on wide screens. On phones the row moves as
  // one piece: animating every card as well costs frames there.
  if (matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
    items.forEach(item => {
      gsap.fromTo(item, { y: 60, rotate: -3 }, { y: 0, rotate: 0, ease: 'power2.out', scrollTrigger: { trigger: item, containerAnimation: travel, start: 'right left', end: 'center 30%', scrub: true } })
    })
  }
  return done
}
