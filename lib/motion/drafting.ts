import { gsap } from 'gsap'

// The light sections read as a drafting table: a grid lit around the pointer
// with guides and live coordinates, a selection box with real measurements
// around the statement, icons that draw their own lines, and cells lit from the
// pointer. All decorative.
export function initDrafting(reduced: boolean) {
  const stops: Array<() => void> = []
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches

  // Live measurements on the selection box, kept current at every width.
  const box = document.querySelector<HTMLElement>('[data-select]')
  const size = box?.querySelector<HTMLElement>('[data-select-size]')
  if (box && size) {
    const ro = new ResizeObserver(() => { size.textContent = `H2 · ${Math.round(box.offsetWidth)} × ${Math.round(box.offsetHeight)}` })
    ro.observe(box)
    stops.push(() => ro.disconnect())
  }

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
    // The selection box draws itself around the statement.
    if (box) {
      const frame = box.querySelector('.select-box__frame')
      gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 75%', once: true } })
        .fromTo(frame, { clipPath: 'inset(0% 0% 100% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
        .fromTo(box.querySelectorAll('.select-box__frame i'), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.06 }, '-=0.35')
        .fromTo(size ?? [], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '-=0.3')
    }

    // Glyphs and icons draw their strokes the first time they are seen.
    document.querySelectorAll<SVGSVGElement>('.principle__glyph, .diff__icon').forEach(svg => {
      const shapes = [...svg.querySelectorAll<SVGGeometryElement>('path, rect, circle')]
      shapes.forEach(s => { const len = s.getTotalLength(); gsap.set(s, { strokeDasharray: len, strokeDashoffset: len }) })
      gsap.to(shapes, { strokeDashoffset: 0, duration: 1.6, ease: 'expo.inOut', stagger: 0.12, scrollTrigger: { trigger: svg, start: 'top 88%', once: true } })
    })

  })
  return () => { stops.forEach(f => f()); ctx.revert() }
}
