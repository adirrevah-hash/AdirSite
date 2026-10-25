import { gsap } from 'gsap'

// The silver line draws as the reader moves through the steps; each node
// lights once the line reaches it. Horizontal on wide screens, vertical on
// phones. Without motion the line is simply drawn and every node is lit.
export function initProcess(reduced: boolean) {
  const wrap = document.querySelector<HTMLElement>('.steps-wrap')
  const fill = document.querySelector<HTMLElement>('[data-process-fill]')
  const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')]
  if (!wrap || !fill || !steps.length) return () => {}

  const light = (p: number) => steps.forEach((s, i) => s.classList.toggle('is-on', p >= i / steps.length - 0.001))
  if (reduced) { light(1); return () => {} }

  const mm = gsap.matchMedia()
  mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, ctx => {
    const wide = ctx.conditions!.wide
    gsap.fromTo(fill, wide ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, {
      ...(wide ? { scaleX: 1 } : { scaleY: 1 }), ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: wide ? 'top 78%' : 'top 70%', end: wide ? 'bottom 55%' : 'bottom 60%', scrub: 0.6,
        onUpdate: self => light(self.progress),
      },
    })
    light(0)
  })
  return () => { mm.revert(); light(1) }
}
