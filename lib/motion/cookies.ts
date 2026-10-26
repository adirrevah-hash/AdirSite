// The cookie notice. Shown once the opening has played, until the visitor
// approves; the approval is remembered. While it shows, the WhatsApp and
// accessibility buttons on a phone rise above it (CSS reads --cookie-lift
// on those two elements only, so the page itself is never restyled).
const KEY = 'ar-cookies'

export function initCookies() {
  const bar = document.querySelector<HTMLElement>('[data-cookie-bar]')
  if (!bar) return () => {}
  try { if (localStorage.getItem(KEY) === '1') return () => {} } catch { /* no storage: ask each visit */ }
  const ok = bar.querySelector<HTMLButtonElement>('[data-cookie-ok]')!
  const lifts = [...document.querySelectorAll<HTMLElement>('[data-a11y], [data-wa-float]')]

  const lift = (on: boolean) => {
    const h = on ? bar.offsetHeight + 12 : 0
    lifts.forEach(el => { el.style.setProperty('--cookie-lift', `${h}px`) })
  }
  const onResize = () => { if (!bar.hidden) lift(true) }

  const show = () => {
    bar.hidden = false
    lift(true)
    requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('is-on')))
  }
  const intro = document.documentElement.classList.contains('has-intro')
  const timer = window.setTimeout(show, intro ? 2900 : 900)

  const onOk = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* applies for this visit only */ }
    bar.classList.remove('is-on')
    lift(false)
    window.setTimeout(() => { bar.hidden = true }, 400)
  }
  ok.addEventListener('click', onOk)
  window.addEventListener('resize', onResize)
  return () => {
    window.clearTimeout(timer)
    ok.removeEventListener('click', onOk)
    window.removeEventListener('resize', onResize)
  }
}
