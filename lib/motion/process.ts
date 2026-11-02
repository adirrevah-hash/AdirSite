import { gsap } from 'gsap'

// The gold line runs from medallion to medallion, curving between the sides
// the steps alternate on. It is measured from where the medallions actually
// sit, so it follows the layout at every width and is redrawn when that
// changes. As the section is read the line draws, and each step lights when
// the line reaches its medallion. Without motion the line is simply drawn and
// every step is lit.
export function initProcess(reduced: boolean) {
  const wrap = document.querySelector<HTMLElement>('.steps-wrap')
  const svg = wrap?.querySelector<SVGSVGElement>('[data-journey]')
  // Scoped to the section: other parts of the page also use data-step.
  const steps = wrap ? [...wrap.querySelectorAll<HTMLElement>('[data-step]')] : []
  if (!wrap || !svg || !steps.length) return () => {}
  const paths = [...svg.querySelectorAll<SVGPathElement>('path')]
  const discs = steps.map(s => s.querySelector<HTMLElement>('[data-step-disc]')!)
  const n = steps.length

  let length = 0
  let progress = reduced ? 1 : 0
  // Where along the line each medallion sits, as a share of its length.
  let marks = steps.map((_, i) => (n > 1 ? i / (n - 1) : 0))

  const draw = (p: number) => {
    progress = p
    const offset = `${length * (1 - p)}`
    paths.forEach(path => { path.style.strokeDashoffset = offset })
    steps.forEach((s, i) => s.classList.toggle('is-on', p >= marks[i] - 0.015))
  }

  const layout = () => {
    const box = wrap.getBoundingClientRect()
    if (!box.width) return
    // Centres in the wrap's own coordinates (the medallions only scale about
    // their centre, so a step being lit does not move them).
    const pts = discs.map(d => {
      const r = d.getBoundingClientRect()
      return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2]
    })
    let d = `M${pts[0][0]},${pts[0][1]}`
    const seg: number[] = [0]
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      const k = (y1 - y0) * 0.62
      d += ` C${x0},${y0 + k} ${x1},${y1 - k} ${x1},${y1}`
      probe.setAttribute('d', d)
      seg.push(probe.getTotalLength())
    }
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
    paths.forEach(path => { path.setAttribute('d', d) })
    length = seg[seg.length - 1] || 1
    marks = seg.map(l => l / length)
    paths.forEach(path => { path.style.strokeDasharray = `${length}` })
    draw(progress)
  }

  layout()
  const ro = new ResizeObserver(layout)
  ro.observe(wrap)
  document.fonts?.ready.then(layout)

  if (reduced) return () => { ro.disconnect() }

  const state = { p: 0 }
  const tween = gsap.to(state, {
    p: 1, ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 72%', end: 'bottom 62%', scrub: 0.6, invalidateOnRefresh: true },
    onUpdate: () => draw(state.p),
  })
  return () => {
    ro.disconnect()
    tween.scrollTrigger?.kill()
    tween.kill()
    draw(1)
  }
}
