// The light sections read as a drafting table: a grid lit around the pointer
// with guides and live coordinates, and cells lit from the pointer, their
// scenes leaning toward it. All decorative.
export function initDrafting(reduced: boolean) {
  const stops: Array<() => void> = []
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches

  // Grid, guides and coordinates follow a mouse within each light section.
  if (fine && !reduced) {
    document.querySelectorAll<HTMLElement>('[data-blueprint]').forEach(bp => {
      const host = bp.parentElement!
      const coord = bp.querySelector<HTMLElement>('[data-coord]')
      let frame = 0
      let ev: PointerEvent | null = null
      const paint = () => {
        frame = 0
        if (!ev) return
        const r = bp.getBoundingClientRect()
        const x = ev.clientX - r.left, y = ev.clientY - r.top
        bp.style.setProperty('--mx', `${x}px`)
        bp.style.setProperty('--my', `${y}px`)
        if (coord) coord.textContent = `x ${Math.round(x)}  y ${Math.round(y)}`
      }
      const onMove = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; ev = e; bp.classList.add('is-lit'); if (!frame) frame = requestAnimationFrame(paint) }
      const onLeave = () => bp.classList.remove('is-lit')
      host.addEventListener('pointermove', onMove, { passive: true })
      host.addEventListener('pointerleave', onLeave)
      stops.push(() => { host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); cancelAnimationFrame(frame) })
    })

    // Each difference cell is lit from where the pointer is, and its scene
    // leans a little toward it.
    document.querySelectorAll<HTMLElement>('[data-spot]').forEach(cell => {
      const scene = cell.querySelector<HTMLElement>('[data-dv]')
      const onMove = (e: PointerEvent) => {
        const r = cell.getBoundingClientRect()
        cell.style.setProperty('--sx', `${e.clientX - r.left}px`)
        cell.style.setProperty('--sy', `${e.clientY - r.top}px`)
        if (scene) {
          scene.style.setProperty('--tx', `${(((e.clientX - r.left) / r.width) - 0.5) * 14}deg`)
          scene.style.setProperty('--ty', `${(0.5 - (e.clientY - r.top) / r.height) * 10}deg`)
        }
      }
      const onLeave = () => { scene?.style.removeProperty('--tx'); scene?.style.removeProperty('--ty') }
      cell.addEventListener('pointermove', onMove, { passive: true })
      cell.addEventListener('pointerleave', onLeave)
      stops.push(() => { cell.removeEventListener('pointermove', onMove); cell.removeEventListener('pointerleave', onLeave) })
    })
  }

  return () => stops.forEach(f => f())
}
