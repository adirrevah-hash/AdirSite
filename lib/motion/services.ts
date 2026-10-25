// The services stage follows the reader: the card nearest the middle of the
// screen, or the one under the pointer or keyboard focus, owns the stage.
// The business-card visual also tilts toward a fine pointer.
export function initServices(reduced: boolean) {
  const items = [...document.querySelectorAll<HTMLElement>('.svc-item[data-svc]')]
  const layers = [...document.querySelectorAll<HTMLElement>('[data-stage]')]
  if (!items.length) return () => {}

  let active = ''
  const setActive = (id: string) => {
    if (id === active) return
    active = id
    items.forEach(i => i.classList.toggle('is-active', i.dataset.svc === id))
    layers.forEach(l => l.classList.toggle('is-active', l.dataset.stage === id))
  }
  setActive(items[0].dataset.svc!)

  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.svc!)
  }, { rootMargin: '-45% 0px -45% 0px' })
  items.forEach(i => io.observe(i))

  const onEnter = (e: Event) => setActive((e.currentTarget as HTMLElement).dataset.svc!)
  items.forEach(i => { i.addEventListener('pointerenter', onEnter); i.addEventListener('focusin', onEnter) })

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
  const tilts = reduced || !fine ? [] : [...document.querySelectorAll<HTMLElement>('[data-tilt]')]
  const onMove = (e: PointerEvent) => {
    for (const t of tilts) {
      const card = t.querySelector<HTMLElement>('.sv-card--front')
      const r = t.getBoundingClientRect()
      if (!card || !r.width) continue
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
      card.style.setProperty('--ry', `${(-12 + x * 18).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${(8 - y * 14).toFixed(2)}deg`)
    }
  }
  if (tilts.length) addEventListener('pointermove', onMove, { passive: true })

  return () => {
    io.disconnect()
    items.forEach(i => { i.removeEventListener('pointerenter', onEnter); i.removeEventListener('focusin', onEnter) })
    removeEventListener('pointermove', onMove)
  }
}
