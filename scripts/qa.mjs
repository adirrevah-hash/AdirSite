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

async function open(browser, opts = {}) {
  const ctx = await browser.newContext({ locale: 'he-IL', ...opts })
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
  check('hero: WebGL object mounted', await page.evaluate(() => document.querySelector('[data-hero]').classList.contains('is-3d')))

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
  for (const id of ['wiserise', 'alumina', 'readytogoo']) {
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
  const meter = await page.evaluate(() => document.querySelector('[data-svc-count]').textContent)
  await page.screenshot({ path: `${OUT}/services.png` })
  check('services: sideways row, keyboard focus brings each card fully into view', cards.every(Boolean) && meter === '06', cards.join(',') + ' meter ' + meter)

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

  for (const w of [1024, 1280, 1680]) { await page.setViewportSize({ width: w, height: 900 }); await wait(300); check(`resize to ${w}: no overflow`, (await overflowX(page)) <= 0) }
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
  await page.click('[data-submit]'); await wait(300)
  const empty = await page.evaluate(() => ({ focus: document.activeElement?.id, errs: document.querySelectorAll('.field__error').length, invalid: document.querySelector('#f-name').getAttribute('aria-invalid') }))
  check('empty submit: field errors, focus on the first invalid field', empty.focus === 'f-name' && empty.errs >= 2 && empty.invalid === 'true', JSON.stringify(empty))
  await page.fill('#f-name', 'בדיקה אוטומטית'); await page.fill('#f-phone', '123')
  await page.click('[data-submit]'); await wait(300)
  check('invalid phone is caught before sending', (await page.evaluate(() => document.activeElement?.id)) === 'f-phone')
  await page.screenshot({ path: `${OUT}/form-errors.png` })
  await page.fill('#f-phone', '050-123-4567'); await page.fill('#f-message', 'צריך דף נחיתה לקמפיין')
  await wait(2600)
  await page.click('[data-submit]')
  await page.waitForSelector('[data-status]:not([hidden])', { timeout: 8000 })
  const st = await page.evaluate(() => { const s = document.querySelector('[data-status]'); return { text: s.textContent, wa: s.querySelector('a')?.getAttribute('href') || '', focused: document.activeElement === s, cls: s.className } })
  const sent = /התקבלה/.test(st.text)
  const handoff = /לא נשלחו/.test(st.text) && st.wa.startsWith('https://wa.me/972538007008?text=') && decodeURIComponent(st.wa).includes('050-1234567') && decodeURIComponent(st.wa).includes('דף נחיתה')
  check('valid lead: delivered, or an honest WhatsApp handoff with the details', sent || handoff, sent ? 'delivered' : 'handoff')
  check('outcome is announced (focus moves to the status)', st.focused)
  await page.screenshot({ path: `${OUT}/form-result.png` })
  check('form: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------------- API guards
{
  const post = (body, headers = {}) => fetch(`${BASE}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': headers.ip || `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  const good = { name: 'בדיקה', phone: '0501234567', service: 'logo', message: '', elapsed: 9000 }
  check('API: cross-origin refused', (await post(good, { origin: 'https://evil.example' })).status === 403)
  check('API: non-JSON refused', (await fetch(`${BASE}/api/contact`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' })).status === 415)
  check('API: oversized body refused', (await post({ ...good, message: 'x'.repeat(9000) })).status === 413)
  check('API: malformed JSON refused', (await post('{nope')).status === 400)
  const inv = await post({ ...good, phone: '123' })
  check('API: invalid fields -> 422 with field errors', inv.status === 422 && !!(await inv.json()).errors?.phone)
  check('API: honeypot gets a silent ok', (await post({ ...good, company: 'bot' })).status === 200)
  check('API: instant submit gets a silent ok', (await post({ ...good, elapsed: 300 })).status === 200)
  const real = await post(good); const rb = await real.json()
  check('API: valid lead delivered or reports not_configured', (real.ok && rb.ok) || (real.status === 503 && rb.reason === 'not_configured'), `${real.status} ${JSON.stringify(rb)}`)
  const codes = []; for (let i = 0; i < 8; i++) codes.push((await post(good, { ip: '10.9.9.9' })).status)
  const first = codes.indexOf(429)
  check('API: rate limit engages and holds', first > -1 && first <= 5 && codes.slice(first).every(c => c === 429), codes.join(','))
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
    return { exp: b.getAttribute('aria-expanded'), sheet: !document.querySelector('[data-menu]').hidden, onTop: b.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)), lock: document.documentElement.style.overflow }
  })
  await page.screenshot({ path: `${OUT}/menu.png` })
  check('menu opens, locks scroll, close button stays tappable', m.exp === 'true' && m.sheet && m.onTop && m.lock === 'hidden', JSON.stringify(m))
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

// ------------------------------------------------------- no-WebGL fallback
{
  const b2 = await chromium.launch({ executablePath: EXE, args: ['--disable-webgl', '--disable-3d-apis'] })
  const { ctx, page, errors } = await open(b2, { viewport: { width: 1440, height: 900 } })
  await wait(1500)
  const fb = await page.evaluate(() => ({ is3d: document.querySelector('[data-hero]').classList.contains('is-3d'), fallback: getComputedStyle(document.querySelector('.hero__fallback')).opacity }))
  await page.screenshot({ path: `${OUT}/hero-nowebgl.png` })
  check('without WebGL the CSS rendition holds the hero', !fb.is3d && +fb.fallback > 0.9 && errors.length === 0, JSON.stringify(fb))
  await ctx.close(); await b2.close()
}

// ---------------------------------------------------------------- links
{
  const { ctx, page } = await open(browser, { viewport: { width: 1440, height: 900 } })
  const bad = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({ h: a.getAttribute('href'), blank: a.target === '_blank', rel: a.rel })).filter(l => {
    if (l.h.startsWith('#')) return !document.querySelector(l.h)
    if (l.h === 'tel:+972538007008') return false
    if (l.h.startsWith('https://wa.me/972538007008')) return !l.blank || !/noopener/.test(l.rel)
    if (['https://www.instagram.com/ar_studio1/', 'https://www.wiserise.co.il/', 'https://www.alumina-group.co.il/', 'https://readytogoo.com/'].includes(l.h)) return !l.blank || !/noopener/.test(l.rel)
    return true
  }))
  check('every link resolves: anchors exist, external links open safely', bad.length === 0, JSON.stringify(bad))
  for (const p of ['/robots.txt', '/sitemap.xml', '/icon.svg']) check(`${p} served`, (await fetch(BASE + p)).ok)
  const res = await fetch(BASE)
  check('security headers set', res.headers.get('x-content-type-options') === 'nosniff' && !!res.headers.get('referrer-policy') && !res.headers.get('x-powered-by'))
  await ctx.close()
}

await browser.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
