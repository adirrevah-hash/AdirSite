// The accessibility panel: larger text (two steps), high contrast, link
// highlighting, a plain readable font and stopping all motion. Each choice is
// a class on <html>, saved in localStorage; the layout's head script applies
// saved choices before first paint. Stopping motion asks the site to restart
// its motion layer in reduced mode, through onMotion.
export const A11Y_KEY = 'ar-a11y'
type Prefs = { text: 0 | 1 | 2; contrast: boolean; links: boolean; font: boolean; still: boolean }
const EMPTY: Prefs = { text: 0, contrast: false, links: false, font: false, still: false }

export function readPrefs(): Prefs {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(A11Y_KEY) || '{}') } } catch { return { ...EMPTY } }
}

export function motionStopped() {
  return document.documentElement.classList.contains('a11y-still')
}

export function initA11y(onMotion: () => void) {
  const root = document.querySelector<HTMLElement>('[data-a11y]')
  if (!root) return () => {}
  const toggle = root.querySelector<HTMLButtonElement>('[data-a11y-toggle]')!
  const panel = root.querySelector<HTMLElement>('[data-a11y-panel]')!
  const opts = [...root.querySelectorAll<HTMLButtonElement>('[data-a11y-opt]')]
  let prefs = readPrefs()

  const apply = () => {
    const html = document.documentElement.classList
    html.toggle('a11y-text-1', prefs.text === 1)
    html.toggle('a11y-text-2', prefs.text === 2)
    html.toggle('a11y-contrast', prefs.contrast)
    html.toggle('a11y-links', prefs.links)
    html.toggle('a11y-font', prefs.font)
    html.toggle('a11y-still', prefs.still)
    opts.forEach(b => {
      const id = b.dataset.a11yOpt as keyof Prefs
      const on = id === 'text' ? prefs.text > 0 : prefs[id] as boolean
      b.setAttribute('aria-pressed', String(on))
      if (id === 'text') b.dataset.step = String(prefs.text)
    })
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(prefs)) } catch { /* private mode: applies for this visit only */ }
  }

  const open = (on: boolean) => {
    panel.hidden = !on
    toggle.setAttribute('aria-expanded', String(on))
    if (on) opts[0].focus()
  }
  const onToggle = () => open(panel.hidden)
  // After a choice the panel closes on its own and the drawer slides back:
  // a short pause first, so the choice is seen to take. A keyboard user is
  // returned to the tab; a pointer user's focus is dropped so the tab retracts.
  let closer = 0
  const closeSoon = (e: Event) => {
    const byKeyboard = (e as MouseEvent).detail === 0
    clearTimeout(closer)
    closer = window.setTimeout(() => {
      open(false)
      if (byKeyboard) toggle.focus()
      else if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur()
    }, 450)
  }
  const onOpt = (e: Event) => {
    const id = (e.currentTarget as HTMLElement).dataset.a11yOpt as keyof Prefs
    const was = prefs.still
    if (id === 'text') prefs.text = ((prefs.text + 1) % 3) as Prefs['text']
    else prefs = { ...prefs, [id]: !prefs[id] }
    apply()
    if (prefs.still !== was) onMotion()
    // Text size and fonts change the layout: measure the scroll scenes again.
    else if (id === 'text' || id === 'font') dispatchEvent(new Event('resize'))
    closeSoon(e)
  }
  const onReset = (e: Event) => {
    const was = prefs.still
    prefs = { ...EMPTY }
    apply()
    if (was) onMotion()
    else dispatchEvent(new Event('resize'))
    closeSoon(e)
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !panel.hidden) { open(false); toggle.focus() } }
  const onOutside = (e: PointerEvent) => { if (!panel.hidden && !root.contains(e.target as Node)) open(false) }
  // Opening a document from the panel closes the panel behind it.
  const onDoc = (e: Event) => { if ((e.target as Element).closest('[data-dialog]')) open(false) }

  apply()
  toggle.addEventListener('click', onToggle)
  opts.forEach(b => b.addEventListener('click', onOpt))
  root.querySelector('[data-a11y-reset]')!.addEventListener('click', onReset)
  root.querySelector('[data-a11y-close]')!.addEventListener('click', () => { open(false); toggle.focus() })
  panel.addEventListener('click', onDoc)
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onOutside)
  return () => {
    clearTimeout(closer)
    toggle.removeEventListener('click', onToggle)
    opts.forEach(b => b.removeEventListener('click', onOpt))
    panel.removeEventListener('click', onDoc)
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('pointerdown', onOutside)
  }
}
