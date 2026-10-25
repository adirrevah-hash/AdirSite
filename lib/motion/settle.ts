// Resolves once the page has settled: on the visitor's first interaction, or
// a few seconds after load, then at the next idle moment. Heavy optional
// work (the WebGL scenes) waits for this, so it never competes with the first
// paint and the first input. Their CSS renditions hold the frame until then.
let settled: Promise<void> | null = null

export function afterSettle(): Promise<void> {
  if (settled) return settled
  settled = new Promise<void>(resolve => {
    const events = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'touchstart', 'keydown'] as const
    let timer = 0
    const go = () => {
      events.forEach(e => removeEventListener(e, go))
      clearTimeout(timer)
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1))
      idle(() => resolve(), { timeout: 800 })
    }
    events.forEach(e => addEventListener(e, go, { once: true, passive: true }))
    const arm = () => { timer = window.setTimeout(go, 3000) }
    if (document.readyState === 'complete') arm()
    else addEventListener('load', arm, { once: true })
  })
  return settled
}
