// End-to-end QA against a running build.
//   npm run build && npm start   then   npm run qa
// BASE_URL defaults to http://localhost:3000. Screenshots go to QA_OUT.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = process.env.QA_OUT || 'qa-shots'
const EXE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium'
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
mkdirSync(OUT, { recursive: true })

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`) }
const wait = ms => new Promise(r => setTimeout(r, ms))

async function open(browser, { cookies = false, ...opts } = {}) {
  const ctx = await browser.newContext({ locale: 'he-IL', ...opts })
  // The cookie notice is approved up front, except in its own test.
  if (!cookies) await ctx.addInitScript(() => { try { localStorage.setItem('ar-cookies', '1') } catch {} })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error' && !/503|Service Unavailable/.test(m.text())) errors.push(m.text()) })
  await page.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await wait(800)
  return { ctx, page, errors }
}
const overflowX = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
const inView = (p, sel) => p.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return !!r && r.top < innerHeight && r.bottom > 0 }, sel)
const scrollTo = (p, sel, off = 0) => p.evaluate(([s, o]) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY + o, behavior: 'instant' }) }, [sel, off])

const browser = await chromium.launch({ executablePath: EXE, args: GL })

// --------------------------------------------------------------- widths
for (const [w, h] of [[360, 780], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]]) {
  const mobile = w < 768
  const { ctx, page, errors } = await open(browser, { viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile })
  const ox = await overflowX(page)
  const heroCta = await page.evaluate(() => { const r = document.querySelector('.hero__actions .btn').getBoundingClientRect(); return r.bottom <= innerHeight + 1 })
  await page.screenshot({ path: `${OUT}/hero-${w}.png` })
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await wait(400)
  check(`${w}px: no horizontal overflow, hero CTA in first screen, no errors`, ox <= 0 && heroCta && errors.length === 0, `overflow ${ox}px${heroCta ? '' : ', CTA below fold'}${errors.length ? ', ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

// --------------------------------------------------------------- desktop
{
  const { ctx, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } })
  const meta = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir, h1: document.querySelectorAll('h1').length,
    title: document.title, desc: document.querySelector('meta[name=description]')?.content || '',
    ld: !!document.querySelector('script[type="application/ld+json"]'),
    imgsNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(h => +h.tagName[1]),
  }))
  check('Hebrew RTL, one h1, title, description, structured data', meta.lang === 'he' && meta.dir === 'rtl' && meta.h1 === 1 && meta.title.length > 10 && meta.desc.length > 40 && meta.ld)
  check('every image has alt text', meta.imgsNoAlt === 0)
  check('heading levels never skip downward', meta.headings.every((l, i) => i === 0 || l <= meta.headings[i - 1] + 1), meta.headings.join(''))
  // The hero's desk scene is loaded and shown (it is the page's largest image).
  const scene = await page.evaluate(() => { const i = document.querySelector('.hero__scene'); const r = i.getBoundingClientRect(); return { loaded: i.complete && i.naturalWidth > 0, w: Math.round(r.width), src: i.currentSrc.split('/').pop() } })
  check('hero: desk scene loaded and in view', scene.loaded && scene.w > 400 && /^scene-desktop\.(avif|webp|jpg)$/.test(scene.src), JSON.stringify(scene))

  for (const [href, target] of [['#work', '#work-title'], ['#services', '#services-title'], ['#process', '#process-title'], ['#contact', '#contact-title']]) {
    await page.click(`.site-nav a[href="${href}"]`)
    await wait(1200)
    check(`nav ${href} lands on its section`, await inView(page, target))
  }
  check('header turns solid once scrolled', await page.evaluate(() => document.querySelector('[data-header]').classList.contains('is-scrolled')))

  // project dialog: opens, takes focus, Escape closes, focus returns
  // On wide screens the gallery runs sideways: keyboard focus must bring
  // each project into view.
  const seen = []
  for (const id of ['wiserise', 'alumina', 'readytogoo', 'orhashachar']) {
    await page.focus(`#work .project__actions button[data-dialog="dlg-${id}"]`); await wait(1200)
    seen.push(await page.evaluate(i => { const r = document.querySelector(`#work [data-dialog="dlg-${i}"].project__stage`).getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && r.top < innerHeight && r.bottom > 0 }, id))
  }
  check('gallery: keyboard focus brings each project fully into view', seen.every(Boolean), seen.join(','))
  await page.focus('#work .project__actions button'); await wait(1200)
  await page.click('#work .project__actions button')
  await wait(500)
  const dlg = await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return { open: !!d, focusIn: !!d && d.contains(document.activeElement) } })
  await page.screenshot({ path: `${OUT}/dialog.png` })
  await page.keyboard.press('Escape'); await wait(300)
  const after = await page.evaluate(() => ({ open: !!document.querySelector('dialog[open]'), focus: document.activeElement?.textContent?.trim().slice(0, 20) }))
  check('project dialog opens with focus inside and closes on Escape', dlg.open && dlg.focusIn && !after.open, JSON.stringify({ dlg, after }))

  // services travel sideways; keyboard focus brings every card into view
  await scrollTo(page, '#services', 0); await wait(800)
  const cards = []
  for (const id of ['websites', 'landing', 'identity', 'cards', 'digital', 'hosting']) {
    await page.focus(`.svc-item[data-svc="${id}"] a[data-service]`); await wait(900)
    cards.push(await page.evaluate(i => { const r = document.querySelector(`.svc-item[data-svc="${i}"]`).getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1 }, id))
  }
  const meter = await page.evaluate(() => document.querySelector('#services [data-row-count]').textContent)
  await page.screenshot({ path: `${OUT}/services.png` })
  check('services: sideways row, keyboard focus brings each card fully into view', cards.every(Boolean) && meter === '06', cards.join(',') + ' meter ' + meter)

  // difference also travels sideways: by the end of its room every card has passed
  const diff = await page.evaluate(() => { const r = document.querySelector('#difference .x-room'); return { top: r.getBoundingClientRect().top + scrollY, travel: parseFloat(getComputedStyle(r).getPropertyValue('--travel')) || 0 } })
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), diff.top + diff.travel); await wait(1500)
  const last = await page.evaluate(() => { const r = document.querySelector('#difference .diff__item:last-child').getBoundingClientRect(); return { count: document.querySelector('#difference [data-row-count]').textContent, inView: r.left >= -1 && r.right <= innerWidth + 1 } })
  check('difference: sideways row ends with the last card in view', diff.travel > 0 && last.count === '04' && last.inView, JSON.stringify({ ...diff, ...last }))

  // process line lights its nodes as it is read
  await scrollTo(page, '.steps-wrap', -200); await wait(600)
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 400); await wait(120) }
  await wait(1200)
  const lit = await page.evaluate(() => document.querySelectorAll('.step.is-on').length)
  check('process nodes light as the line reaches them', lit >= 2, `${lit} lit`)

  // reverse fast scroll returns to a clean top
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, -900); await wait(16) }
  await wait(2000) // scrubbed tweens ease in behind the scroll
  const top = await page.evaluate(() => ({ y: scrollY, copy: Math.min(...[...document.querySelectorAll('.hero__inner, .hero__title .w, .hero__sub, .hero__actions')].map(e => +getComputedStyle(e).opacity)) }))
  check('reverse scroll restores the hero', top.y === 0 && +top.copy > 0.95, JSON.stringify(top))

  for (const w of [1024, 1280, 1680]) {
    await page.setViewportSize({ width: w, height: 900 }); await wait(300)
    const ox = await overflowX(page)
    // Name the widest offender, so a failure says where to look.
    const who = ox > 0 ? await page.evaluate(() => [...document.querySelectorAll('body *')].map(e => [e, e.getBoundingClientRect()]).filter(([, r]) => r.right > innerWidth + 1).sort((a, b) => b[1].right - a[1].right).slice(0, 3).map(([e, r]) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} ${Math.round(r.right)} ${getComputedStyle(e).position}`).join(' | ')) : ''
    check(`resize to ${w}: no overflow`, ox <= 0, ox > 0 ? `${ox}px: ${who}` : '')
  }
  check('desktop: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------------- layout shift
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { ctx, page } = await open(browser, { viewport: { width: w, height: h } })
  const load = await page.evaluate(() => window.__cls)
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 500); await wait(40) }
  await wait(800)
  const total = await page.evaluate(() => window.__cls)
  check(`${w}px: layout shift on load and through scroll < 0.1`, total < 0.1, `load ${load.toFixed(4)}, total ${total.toFixed(4)}`)
  await ctx.close()
}

// ----------------------------------------------------------------- form
{
  const { ctx, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } })
  await page.focus('.svc-item[data-svc="landing"] a[data-service]'); await wait(1200)
  await page.click('.svc-item[data-svc="landing"] a[data-service]'); await wait(1200)
  check('"לבקש הצעה" preselects the service', (await page.inputValue('#f-service')) === 'landing')

  await page.fill('#f-service', '').catch(() => {})
  await page.selectOption('#f-service', 'landing')
  await page.click('[data-submit]', { force: true }); await wait(300)
  const empty = await page.evaluate(() => ({ focus: document.activeElement?.id, errs: document.querySelectorAll('.field__error').length, invalid: document.querySelector('#f-name').getAttribute('aria-invalid') }))
  const idle = await page.evaluate(() => { const a = document.querySelector('[data-submit]'); return { href: a.hasAttribute('href'), dis: a.getAttribute('aria-disabled'), hint: document.querySelector('[data-send-hint]').textContent } })
  check('send stays inactive until the form is complete, and says what is missing', !idle.href && idle.dis === 'true' && /חסר עדיין: שם, טלפון תקין/.test(idle.hint), JSON.stringify(idle))
  check('empty submit: field errors, focus on the first invalid field', empty.focus === 'f-name' && empty.errs >= 2 && empty.invalid === 'true', JSON.stringify(empty))
  await page.fill('#f-name', 'בדיקה אוטומטית'); await page.fill('#f-phone', '123')
  await page.click('[data-submit]', { force: true }); await wait(300)
  check('invalid phone is caught before sending', (await page.evaluate(() => document.activeElement?.id)) === 'f-phone')
  await page.screenshot({ path: `${OUT}/form-errors.png` })
  await page.fill('#f-phone', '050-123-4567'); await page.fill('#f-message', 'צריך דף נחיתה לקמפיין')
  // Without agreeing to the policies nothing opens, and the checkbox says why.
  await ctx.route('https://wa.me/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: 'whatsapp' }))
  let early = 0; const countTabs = () => early++; ctx.on('page', countTabs)
  await page.click('[data-submit]', { force: true }); await wait(800)
  ctx.off('page', countTabs)
  const noConsent = await page.evaluate(() => ({ focus: document.activeElement?.id, err: !!document.querySelector('#f-consent-err') }))
  check('consent is required: no WhatsApp, an error, focus on the checkbox', early === 0 && noConsent.focus === 'f-consent' && noConsent.err, JSON.stringify({ early, ...noConsent }))
  await page.click('#f-consent')
  const ready = await page.evaluate(() => { const a = document.querySelector('[data-submit]'); return { href: a.hasAttribute('href'), dis: a.hasAttribute('aria-disabled') } })
  check('send becomes active once every required field is filled in', ready.href && !ready.dis, JSON.stringify(ready))
  // A valid lead opens WhatsApp to the studio with everything filled in.
  const [tab] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }), page.click('[data-submit]', { force: true })])
  const waUrl = decodeURIComponent(tab.url())
  await tab.close()
  const st = await page.evaluate(() => ({ said: document.querySelector('[data-status]').textContent, boxes: document.querySelectorAll('.form-status').length, x: scrollX }))
  const carries = ['בדיקה אוטומטית', '050-1234567', 'דף נחיתה', 'צריך דף נחיתה לקמפיין'].every(t => waUrl.includes(t))
  check('valid lead opens WhatsApp to 053-800-7008 with every field filled in', waUrl.startsWith('https://wa.me/972538007008?text=') && carries, waUrl.slice(0, 90))
  check('after sending: no message box on the page, the page stays put, screen readers hear it', st.boxes === 0 && st.x === 0 && /וואטסאפ נפתח/.test(st.said), JSON.stringify(st))
  await page.screenshot({ path: `${OUT}/form-result.png` })
  check('form: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// A filled-in lead, ready to send.
async function fillLead(page) {
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView())
  await page.fill('#f-name', 'בדיקה אוטומטית'); await page.fill('#f-phone', '050-123-4567')
  await page.selectOption('#f-service', 'landing')
  await page.check('#f-consent', { force: true })
}

// On a phone a tap on the send link opens WhatsApp with the details.
{
  const { ctx, page } = await open(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await ctx.route('https://wa.me/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: 'whatsapp' }))
  await fillLead(page)
  const [tab] = await Promise.all([ctx.waitForEvent('page', { timeout: 8000 }), page.tap('[data-submit]')])
  const url = decodeURIComponent(tab.url())
  check('phone: a tap on send opens WhatsApp with the details', url.startsWith('https://wa.me/972538007008?text=') && url.includes('בדיקה אוטומטית'), url.slice(0, 70))
  await ctx.close()
}

// In a frame (such as a preview) only a real link the visitor taps gets out,
// so the send button is one, already carrying the details.
{
  const ctx = await browser.newContext({ locale: 'he-IL', viewport: { width: 1280, height: 900 } })
  // The site forbids framing; this test lifts that for its own frame.
  await ctx.route(`${BASE}/`, async r => {
    const res = await r.fetch()
    const headers = { ...res.headers() }; delete headers['x-frame-options']; delete headers['content-security-policy']
    r.fulfill({ response: res, headers })
  })
  const page = await ctx.newPage()
  await page.setContent(`<iframe id="f" src="${BASE}" sandbox="allow-scripts allow-same-origin allow-forms" style="width:1200px;height:880px;border:0"></iframe>`)
  const frame = await (await page.waitForSelector('#f')).contentFrame()
  await frame.waitForSelector('[data-lead-form]', { state: 'attached' }); await wait(2500)
  await fillLead(frame)
  const link = await frame.evaluate(() => { const a = document.querySelector('[data-submit]'); return { tag: a.tagName, blank: a.target === '_blank', href: decodeURIComponent(a.href) } })
  check('send is a real link to WhatsApp that carries the details', link.tag === 'A' && link.blank && link.href.startsWith('https://wa.me/972538007008?text=') && link.href.includes('בדיקה אוטומטית'), JSON.stringify(link).slice(0, 90))
  await ctx.close()
}

// --------------------------------------------------------- cookie notice
{
  const { ctx, page, errors } = await open(browser, { cookies: true, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  // It waits for the opening to play first.
  await wait(3200)
  const shown = await page.evaluate(() => {
    const bar = document.querySelector('[data-cookie-bar]'), r = bar.getBoundingClientRect()
    const a11y = document.querySelector('[data-a11y]').getBoundingClientRect()
    return { visible: !bar.hidden && getComputedStyle(bar).opacity === '1', inside: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, clear: a11y.bottom <= r.top + 1, x: document.documentElement.scrollWidth - innerWidth }
  })
  check('cookie notice shows on a first visit, inside the screen, floating buttons above it', shown.visible && shown.inside && shown.clear && shown.x <= 0, JSON.stringify(shown))
  await page.tap('[data-cookie-bar] [data-dialog="dlg-privacy"]'); await wait(500)
  const policy = await page.evaluate(() => document.getElementById('dlg-privacy').open)
  await page.keyboard.press('Escape'); await wait(300)
  check('cookie notice links to the privacy policy', policy)
  await page.tap('[data-cookie-ok]'); await wait(600)
  const gone = await page.evaluate(() => document.querySelector('[data-cookie-bar]').hidden)
  await page.reload({ waitUntil: 'networkidle' }); await wait(1500)
  const again = await page.evaluate(() => document.querySelector('[data-cookie-bar]').hidden)
  check('approving hides the notice, and it stays hidden on the next visit', gone && again, `${gone},${again}`)
  check('cookie notice: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------- accessibility panel
{
  const { ctx, page, errors } = await open(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  // The drawer sits off the right edge; only a strip shows, and that is what a thumb taps.
  const tapDrawer = async () => { const r = await page.evaluate(() => { const b = document.querySelector('[data-a11y-toggle]').getBoundingClientRect(); return { x: (b.left + innerWidth) / 2, y: b.top + b.height / 2, peek: innerWidth - b.left } }); await page.touchscreen.tap(r.x, r.y); return r.peek }
  const peek = await tapDrawer(); await wait(400)
  const opened = await page.evaluate(() => ({ open: !document.querySelector('[data-a11y-panel]').hidden, focus: document.activeElement?.dataset.a11yOpt }))
  // Each choice closes the panel and the drawer by itself; reopen for the next.
  let closes = 0
  for (const [k, id] of ['text', 'text', 'contrast', 'links', 'font', 'still'].entries()) {
    if (k) { await tapDrawer(); await wait(300) }
    await page.tap(`[data-a11y-opt="${id}"]`); await wait(1200) // 450ms pause, then the tab's 420ms slide
    // closed means the panel is gone and the tab is back to its strip
    if (await page.evaluate(() => document.querySelector('[data-a11y-panel]').hidden && innerWidth - document.querySelector('[data-a11y-toggle]').getBoundingClientRect().left < 30)) closes++
  }
  await wait(800)
  const on = await page.evaluate(() => ({ cls: document.documentElement.className, vw: innerWidth, sideways: document.querySelectorAll('.x-room.is-h').length }))
  await page.reload({ waitUntil: 'networkidle' }); await wait(1000)
  const kept = await page.evaluate(() => document.documentElement.classList.contains('a11y-text-2') && document.documentElement.classList.contains('a11y-still'))
  await tapDrawer(); await wait(300); await page.tap('[data-a11y-reset]'); await wait(1200)
  const reset = await page.evaluate(() => ({ left: /a11y-/.test(document.documentElement.className), sideways: document.querySelectorAll('.x-room.is-h').length }))
  check('accessibility drawer: a 20-30px strip on the edge, opens by tap', peek >= 20 && peek <= 30, `${peek}px`)
  check('accessibility: after each choice the panel closes and the tab slides back', closes === 6, `${closes}/6`)
  check('accessibility panel: opens with focus, every option applies, page stays phone-wide', opened.open && opened.focus === 'text' && ['a11y-text-2', 'a11y-contrast', 'a11y-links', 'a11y-font', 'a11y-still'].every(c => on.cls.includes(c)) && on.vw === 390, JSON.stringify({ opened, on }))
  check('accessibility: stopping motion turns the sideways rows off; choices survive a reload; reset restores', on.sideways === 0 && kept && !reset.left && reset.sideways > 0, JSON.stringify({ kept, reset }))
  check('accessibility: tapping the tab again closes the panel and tucks the tab back', await (async () => {
    await tapDrawer(); await wait(400)
    const open = await page.evaluate(() => !document.querySelector('[data-a11y-panel]').hidden)
    await tapDrawer(); await wait(600)
    return open && await page.evaluate(() => document.querySelector('[data-a11y-panel]').hidden && innerWidth - document.querySelector('[data-a11y-toggle]').getBoundingClientRect().left < 30)
  })())
  check('accessibility: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ---------------------------------------------------------------- mobile
{
  const { ctx, page, errors } = await open(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const small = await page.evaluate(() => [...document.querySelectorAll('a, button, select, input, textarea')].filter(e => {
    const r = e.getBoundingClientRect(); if (!r.width || e.closest('[hidden], dialog:not([open]), .hp') || getComputedStyle(e).visibility === 'hidden') return false
    return r.height < 24 && !e.closest('p, li small')
  }).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 18)))
  check('mobile: tap targets at least 24px', small.length === 0, small.join(', '))

  await page.tap('[data-menu-btn]'); await wait(400)
  const m = await page.evaluate(() => {
    const b = document.querySelector('[data-menu-btn]'), r = b.getBoundingClientRect()
    return { exp: b.getAttribute('aria-expanded'), sheet: !document.querySelector('[data-menu]').hidden, onTop: b.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)), y: scrollY }
  })
  // the page behind holds still: a swipe over the menu does not scroll it
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -400, speed: 2000 })
  await wait(400)
  m.lock = (await page.evaluate(() => scrollY)) === m.y
  await page.screenshot({ path: `${OUT}/menu.png` })
  check('menu opens, locks scroll, close button stays tappable', m.exp === 'true' && m.sheet && m.onTop && m.lock === true, JSON.stringify(m))
  await page.tap('[data-menu-btn]'); await wait(400)
  check('tapping the button closes the menu', (await page.getAttribute('[data-menu-btn]', 'aria-expanded')) === 'false')
  await page.tap('[data-menu-btn]'); await wait(400)
  await page.keyboard.press('Escape'); await wait(400)
  check('Escape closes the menu', (await page.getAttribute('[data-menu-btn]', 'aria-expanded')) === 'false')
  await page.tap('[data-menu-btn]'); await wait(400)
  await page.tap('#menu-sheet a[href="#contact"]'); await wait(1400)
  check('menu link navigates and closes the menu', (await inView(page, '#contact-title')) && (await page.getAttribute('[data-menu-btn]', 'aria-expanded')) === 'false')

  const fab = () => page.evaluate(() => document.querySelector('[data-wa-float]').classList.contains('is-on'))
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(400); const a = await fab()
  await scrollTo(page, '#services', 200); await wait(400); const b = await fab()
  await scrollTo(page, '#contact', 100); await wait(500); const c = await fab()
  check('floating WhatsApp: off on hero, on while reading, off at contact', !a && b && !c, `${a},${b},${c}`)

  await scrollTo(page, '#work .project', -60); await wait(800)
  await page.tap('#work .project__actions button'); await wait(500)
  check('mobile: project dialog opens by tap', await page.evaluate(() => !!document.querySelector('dialog[open]')))
  await page.screenshot({ path: `${OUT}/dialog-mobile.png` })
  await page.tap('dialog[open] [data-dialog-close]'); await wait(300)
  check('mobile: dialog closes from its close button', await page.evaluate(() => !document.querySelector('dialog[open]')))
  check('mobile: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// -------------------------------------------------------- reduced motion
{
  const { ctx, page, errors } = await open(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await scrollTo(page, '#approach', 0); await wait(600)
  const r = await page.evaluate(() => ({
    claimed: document.documentElement.classList.contains('motion-ready'),
    lineHidden: [...document.querySelectorAll('[data-reveal] .line > span')].some(s => getComputedStyle(s).transform !== 'none'),
    allLit: document.querySelectorAll('.step.is-on').length === document.querySelectorAll('.step').length,
  }))
  check('reduced motion: nothing hidden for animation, process shown complete', !r.claimed && !r.lineHidden && r.allLit, JSON.stringify(r))
  check('reduced: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// --------------------------------------------------------- keyboard focus
{
  const { ctx, page } = await open(browser, { viewport: { width: 1440, height: 900 } })
  const seen = []
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab'); await wait(60)
    seen.push(await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { t: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 16), ring: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 } }))
  }
  check('keyboard: skip link first, focus ring always visible', seen[0].t === 'דילוג לתוכן' && seen.every(s => s.ring), seen.map(s => s.t).join(' > '))
  await ctx.close()
}

// ------------------------------------------------------- no-WebGL
{
  // Only the approach section uses WebGL; without it the page still runs clean.
  const b2 = await chromium.launch({ executablePath: EXE, args: ['--disable-webgl', '--disable-3d-apis'] })
  const { ctx, page, errors } = await open(b2, { viewport: { width: 1440, height: 900 } })
  await page.evaluate(() => document.querySelector('#approach').scrollIntoView()); await wait(2500)
  const fb = await page.evaluate(() => ({ is3d: document.querySelector('[data-forms]').classList.contains('is-3d'), css: getComputedStyle(document.querySelector('.philo__fallback')).opacity }))
  check('without WebGL the CSS forms hold the approach section', !fb.is3d && +fb.css > 0.9 && errors.length === 0, JSON.stringify(fb))
  await ctx.close(); await b2.close()
}

// ---------------------------------------------------------------- links
{
  const { ctx, page } = await open(browser, { viewport: { width: 1440, height: 900 } })
  const bad = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({ h: a.getAttribute('href'), blank: a.target === '_blank', rel: a.rel })).filter(l => {
    if (l.h.startsWith('#')) return !document.querySelector(l.h)
    if (l.h === 'tel:+972538007008') return false
    if (l.h.startsWith('https://wa.me/972538007008')) return !l.blank || !/noopener/.test(l.rel)
    if (['https://www.instagram.com/ar_studio1/', 'https://www.wiserise.co.il/', 'https://www.alumina-group.co.il/', 'https://readytogoo.com/', 'https://orashachar.co.il/'].includes(l.h)) return !l.blank || !/noopener/.test(l.rel)
    return true
  }))
  check('every link resolves: anchors exist, external links open safely', bad.length === 0, JSON.stringify(bad))
  for (const p of ['/robots.txt', '/sitemap.xml', '/icon.svg', '/og.jpg']) check(`${p} served`, (await fetch(BASE + p)).ok)
  const head = await (await fetch(BASE)).text()
  check('share image: og:image 1200x630 and a large card', /property="og:image" content="[^"]*\/og\.jpg"/.test(head) && /og:image:width" content="1200"/.test(head) && /twitter:card" content="summary_large_image"/.test(head))
  const res = await fetch(BASE)
  check('security headers set', res.headers.get('x-content-type-options') === 'nosniff' && !!res.headers.get('referrer-policy') && !res.headers.get('x-powered-by'))
  // A missing address answers 404 with the studio's own page and a way home.
  const page404 = await ctx.newPage()
  const r404 = await page404.goto(BASE + '/no/such/page', { waitUntil: 'networkidle' })
  const nf = await page404.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, home: !!document.querySelector('main a[href="/"].btn'), intro: document.documentElement.classList.contains('has-intro'), x: document.documentElement.scrollWidth - innerWidth }))
  check('404: Hebrew page with a link home, no intro', r404.status() === 404 && /לא נמצא/.test(nf.h1 || '') && nf.home && !nf.intro && nf.x <= 0, JSON.stringify(nf))
  await ctx.close()
}

await browser.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
