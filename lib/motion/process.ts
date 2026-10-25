import { gsap } from 'gsap'

// Wide screens: the section holds while the silver line draws across the
// steps; each step lights as the line reaches it and the large counter rolls
// to it. Phones: the line draws down the steps as they scroll past.
// Without motion the line is simply drawn and every step is lit.
export function initProcess(reduced: boolean) {
  const section = document.querySelector<HTMLElement>('[data-process]')
  const wrap = document.querySelector<HTMLElement>('.steps-wrap')
  const fill = document.querySelector<HTMLElement>('[data-process-fill]')
  const roll = document.querySelector<HTMLElement>('[data-process-roll]')
  const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')]
  if (!section || !wrap || !fill || !steps.length) return () => {}

  const n = steps.length
  const light = (p: number) => steps.forEach((s, i) => s.classList.toggle('is-on', p >= i / n - 0.001))
  if (reduced) { light(1); return () => {} }

  let current = -1
  const rollTo = (p: number) => {
    const k = Math.min(n - 1, Math.floor(p * n))
    if (k === current || !roll) return
    current = k
    gsap.to(roll, { yPercent: (-100 * k) / n, duration: 0.8, ease: 'expo.out', overwrite: true })
  }

  const mm = gsap.matchMedia()
  mm.add('(min-width: 900px)', () => {
    gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: {
        trigger: section, pin: true, scrub: 0.6, invalidateOnRefresh: true,
        start: () => (section.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top'),
        end: '+=170%',
        onUpdate: self => { light(self.progress); rollTo(self.progress) },
      },
    })
    light(0); rollTo(0)
    return () => { current = -1; gsap.set(roll, { clearProps: 'transform' }) }
  })
  mm.add('(max-width: 899px)', () => {
    gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top 70%', end: 'bottom 60%', scrub: 0.6, onUpdate: self => light(self.progress) },
    })
    light(0)
  })
  return () => { mm.revert(); light(1) }
}
