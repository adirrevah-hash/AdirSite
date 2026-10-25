import { gsap } from 'gsap'

// The light sections read as a drafting table: a grid lit around the pointer
// with guides and live coordinates, icons that draw their own lines, and cells
// lit from the pointer. All decorative.
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

    // Each difference cell is lit from where the pointer is.
    document.querySelectorAll<HTMLElement>('[data-spot]').forEach(cell => {
      const onMove = (e: PointerEvent) => {
        const r = cell.getBoundingClientRect()
        cell.style.setProperty('--sx', `${e.clientX - r.left}px`)
        cell.style.setProperty('--sy', `${e.clientY - r.top}px`)
      }
      cell.addEventListener('pointermove', onMove, { passive: true })
      stops.push(() => cell.removeEventListener('pointermove', onMove))
    })
  }

  if (reduced) return () => stops.forEach(f => f())

  const ctx = gsap.context(() => {
    // Glyphs and icons draw their strokes the first time they are seen.
    document.querySelectorAll<SVGSVGElement>('.diff__icon').forEach(svg => {
      const shapes = [...svg.querySelectorAll<SVGGeometryElement>('path, rect, circle')]
      shapes.forEach(s => { const len = s.getTotalLength(); gsap.set(s, { strokeDasharray: len, strokeDashoffset: len }) })
      gsap.to(shapes, { strokeDashoffset: 0, duration: 1.6, ease: 'expo.inOut', stagger: 0.12, scrollTrigger: { trigger: svg, start: 'top 88%', once: true } })
    })

  })
  return () => { stops.forEach(f => f()); ctx.revert() }
}
