// End-to-end QA against a running build: `npm run build && npm start`, then
// `npm run qa` (BASE_URL defaults to http://localhost:3000).
// Covers layout, navigation, the mobile menu, the contact form end to end,
// the API's guards, reduced motion, layout shift and outbound links.
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = process.env.QA_OUT || 'qa-shots'
const EXE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium'
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`)
}
const wait = ms => new Promise(r => setTimeout(r, ms))

const browser = await chromium.launch({ executablePath: EXE })

async function open(opts = {}) {
  const ctx = await browser.newContext({ locale: 'he-IL', ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await wait(400)
  return { ctx, page, errors }
}
const overflowX = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth)
const visibleIn = (p, sel) => p.evaluate(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return !!r && r.top < innerHeight && r.bottom > 0 }, sel)

// ---------------------------------------------------------------- desktop
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } })
  const meta = await page.evaluate(() => ({
    lang: document.documentElement.lang, dir: document.documentElement.dir,
    h1: document.querySelectorAll('h1').length, title: document.title,
    desc: document.querySelector('meta[name=description]')?.content || '',
    ld: !!document.querySelector('script[type="application/ld+json"]'),
  }))
  check('html is Hebrew RTL', meta.lang === 'he' && meta.dir === 'rtl')
  check('exactly one h1, title and description present', meta.h1 === 1 && meta.title.length > 10 && meta.desc.length > 30)
  check('structured data present', meta.ld)
  check('desktop: no horizontal overflow', (await overflowX(page)) <= 0)
  check('hero CTA visible in first viewport', await page.evaluate(() => { const r = document.querySelector('.hero__actions .btn').getBoundingClientRect(); return r.bottom < innerHeight }))
  await page.screenshot({ path: `${OUT}/desktop-hero.png` })

  const work = await page.evaluate(() => ({
    n: document.querySelectorAll('#work [data-project]').length,
    names: [...document.querySelectorAll('#work .project__caption h3')].map(h => h.textContent),
    newTab: [...document.querySelectorAll('#work a[href^="https"]')].every(a => a.target === '_blank' && a.rel.includes('noopener')),
  }))
  check('portfolio shows the three projects, opening in a new tab', work.n === 3 && work.newTab, work.names.join(', '))

  // Every heading/section reachable from the nav
  for (const [href, target] of [['#services', '.svc'], ['#work', '#work-title'], ['#process', '#process-title'], ['#contact', '#contact-title']]) {
    await page.click(`.site-header .nav a[href="${href}"]`)
    await wait(1400)
    check(`nav ${href} lands on its content`, await visibleIn(page, target))
  }

  // Header tone follows the section under it (text must not vanish)
  const tones = []
  for (const sel of ['#top', '#services', '#work', '#process', '#contact']) {
    await page.evaluate(s => { const el = document.querySelector(s); scrollTo({ top: el.offsetTop + 40, behavior: 'instant' }) }, sel)
    await wait(350)
    tones.push(await page.evaluate(() => {
      const h = document.querySelector('.site-header')
      const under = document.elementsFromPoint(innerWidth / 2, 2).find(e => e.dataset?.tone && !e.closest('.site-header'))
      return [h.dataset.tone, under?.dataset.tone]
    }))
  }
  check('header tone matches the section beneath it', tones.every(([a, b]) => a === b), JSON.stringify(tones))

  // Fast scroll down and back up: the hero is restored exactly
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 700); await wait(16) }
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, -700); await wait(16) }
  await wait(900)
  const hero = await page.evaluate(() => ({ y: scrollY, t: document.querySelector('.hero__mark').style.transform, copy: getComputedStyle(document.querySelector('.hero__copy')).opacity }))
  check('reverse scroll restores the hero', hero.y === 0 && /scale\(1(\.0+)?\)/.test(hero.t) && parseFloat(hero.copy) > 0.95, JSON.stringify(hero))

  // Process: closed laptop on arrival, finished live site at the end of the pin
  await page.evaluate(() => { const s = document.getElementById('process'); scrollTo({ top: s.offsetTop - innerHeight * 0.65, behavior: 'instant' }) })
  await wait(500)
  const closed = await page.evaluate(() => document.querySelector('.mac__lid').style.transform)
  await page.evaluate(() => { const s = document.getElementById('process'); scrollTo({ top: s.offsetTop + s.offsetHeight - innerHeight - 10, behavior: 'instant' }) })
  await wait(600)
  const proc = await page.evaluate(() => ({
    active: [...document.querySelectorAll('.pstep')].findIndex(s => s.classList.contains('is-active')),
    lid: document.querySelector('.mac__lid').style.transform,
    url: document.querySelector('.scr__typed').textContent,
    live: parseFloat(document.querySelector('.scr__live').style.opacity),
    site: document.querySelector('.scr__site').style.clipPath,
    rail: document.querySelector('.prail__fill').style.transform,
  }))
  check('process: laptop arrives closed', /rotateX\(-90/.test(closed), closed)
  check('process: ends open, live, typed, last step active, rail full', proc.active === 3 && /rotateX\(12/.test(proc.lid) && proc.url === 'your-business.co.il' && proc.live > 0.95 && proc.site === 'none' && /scaleX\(1(\.0+)?\)/.test(proc.rail), JSON.stringify(proc))
  await page.screenshot({ path: `${OUT}/desktop-process-end.png` })

  // Reload mid-page keeps a coherent state
  await page.evaluate(() => { const s = document.getElementById('process'); scrollTo({ top: s.offsetTop + innerHeight, behavior: 'instant' }) })
  await wait(300)
  await page.reload({ waitUntil: 'networkidle' })
  await wait(900)
  const mid = await page.evaluate(() => ({ y: scrollY, steps: document.querySelectorAll('.pstep.is-active').length }))
  check('reload mid-process: one active step', mid.steps === 1, JSON.stringify(mid))

  // Resize keeps the layout inside the viewport
  for (const w of [1024, 1280, 1920]) {
    await page.setViewportSize({ width: w, height: 900 })
    await wait(400)
    check(`resize ${w}: no horizontal overflow`, (await overflowX(page)) <= 0)
  }

  check('desktop: cumulative layout shift < 0.1', (await page.evaluate(() => window.__cls)) < 0.1, String(await page.evaluate(() => window.__cls)))
  check('desktop: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------------ the form, UI
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } })
  // Service CTA preselects the form
  await page.evaluate(() => document.querySelector('a[data-service="landing"]').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await wait(400)
  await page.click('a[data-service="landing"]')
  await wait(1200)
  check('service CTA preselects the service', (await page.inputValue('#f-service')) === 'landing')

  // Empty submit: errors shown, focus moves to the first bad field
  await page.fill('#f-name', '')
  await page.click('button[type=submit]')
  const empty = await page.evaluate(() => ({ focus: document.activeElement?.id, errs: [...document.querySelectorAll('.field__error')].map(e => e.textContent), invalid: document.querySelector('#f-name').getAttribute('aria-invalid') }))
  check('empty submit: Hebrew errors, focus on first invalid field', empty.focus === 'f-name' && empty.errs.length >= 2 && empty.invalid === 'true', JSON.stringify(empty))

  await page.fill('#f-name', 'בדיקה אוטומטית')
  await page.fill('#f-phone', '12345')
  await page.click('button[type=submit]')
  check('bad phone is rejected in the browser', (await page.evaluate(() => document.activeElement?.id)) === 'f-phone')
  await page.screenshot({ path: `${OUT}/form-errors.png` })

  await page.fill('#f-phone', '050-123-4567')
  await page.fill('#f-message', 'צריך דף נחיתה לקמפיין')
  await wait(2600) // humans take longer than the bot trap
  await page.click('button[type=submit]')
  await page.waitForSelector('.form-status', { timeout: 8000 })
  const after = await page.evaluate(() => ({
    text: document.querySelector('.form-status').textContent,
    wa: document.querySelector('.form-status a')?.getAttribute('href') || '',
    focused: document.activeElement?.classList.contains('form-status'),
  }))
  const delivered = /התקבלה/.test(after.text)
  const handoff = after.wa.startsWith('https://wa.me/972538007008?text=') && decodeURIComponent(after.wa).includes('050-1234567') && decodeURIComponent(after.wa).includes('דף נחיתה')
  check('valid submit ends in delivery or a filled-in WhatsApp handoff', delivered || handoff, delivered ? 'delivered' : after.wa.slice(0, 60) + '…')
  check('result is announced (focus moves to the status)', after.focused)
  await page.screenshot({ path: `${OUT}/form-result.png` })
  check('form: no console errors', errors.filter(e => !/503|Service Unavailable/.test(e)).length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------------ the API guards
{
  const post = (body, headers = {}) => fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': headers.ip || `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  const good = { name: 'בדיקה', phone: '0501234567', service: 'logo', message: '', elapsed: 9000 }
  check('API: cross-origin request refused', (await post(good, { origin: 'https://evil.example' })).status === 403)
  check('API: non-JSON refused', (await fetch(`${BASE}/api/contact`, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'x' })).status === 415)
  check('API: oversized body refused', (await post({ ...good, message: 'x'.repeat(9000) })).status === 413)
  check('API: malformed JSON refused', (await post('{nope')).status === 400)
  const inv = await post({ ...good, phone: '123' })
  check('API: invalid fields -> 422 with field errors', inv.status === 422 && !!(await inv.json()).errors?.phone)
  const hp = await post({ ...good, company: 'Acme bots' })
  check('API: honeypot gets a silent ok', hp.status === 200 && (await hp.json()).ok === true)
  const fast = await post({ ...good, elapsed: 300 })
  check('API: instant submit gets a silent ok', fast.status === 200)
  const real = await post(good)
  const realBody = await real.json()
  check('API: valid lead is delivered or reports not_configured', (real.status === 200 && realBody.ok) || (real.status === 503 && realBody.reason === 'not_configured'), `${real.status} ${JSON.stringify(realBody)}`)
  const codes = []
  for (let i = 0; i < 8; i++) codes.push((await post(good, { ip: '10.9.9.9' })).status)
  const first = codes.indexOf(429)
  check('API: rate limit engages within the window and holds', first > -1 && first <= 5 && codes.slice(first).every(c => c === 429), codes.join(','))
}

// ---------------------------------------------------------------- mobile
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  check('mobile: no horizontal overflow', (await overflowX(page)) <= 0)
  check('mobile: hero CTA in first viewport', await page.evaluate(() => document.querySelector('.hero__actions .btn').getBoundingClientRect().bottom < innerHeight))
  const small = await page.evaluate(() => [...document.querySelectorAll('a, button, select, input, textarea')].filter(e => {
    const r = e.getBoundingClientRect(); if (!r.width || getComputedStyle(e).visibility === 'hidden' || e.closest('[inert]') || e.closest('.hp')) return false
    return r.height < 24 && !e.closest('p, li, small, .footer__legal')
  }).map(e => e.textContent.trim().slice(0, 20)))
  check('mobile: standalone tap targets at least 24px tall', small.length === 0, small.join(', '))
  await page.screenshot({ path: `${OUT}/mobile-hero.png` })

  // Menu: opens, traps, closes on Escape, links navigate and close it
  await page.tap('button[aria-controls=menu-sheet]')
  await wait(300)
  const opened = await page.evaluate(() => ({ exp: document.querySelector('button[aria-controls=menu-sheet]').getAttribute('aria-expanded'), vis: getComputedStyle(document.getElementById('menu-sheet')).visibility, lock: document.body.style.overflow }))
  check('mobile menu opens and locks scroll', opened.exp === 'true' && opened.vis === 'visible' && opened.lock === 'hidden', JSON.stringify(opened))
  const closeOnTop = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-controls=menu-sheet]'); const r = btn.getBoundingClientRect()
    return btn.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
  })
  check('mobile menu: close button stays visible and tappable', closeOnTop)
  await page.screenshot({ path: `${OUT}/mobile-menu.png` })
  await page.tap('button[aria-controls=menu-sheet]')
  await wait(300)
  check('tapping the close button closes the menu', (await page.getAttribute('button[aria-controls=menu-sheet]', 'aria-expanded')) === 'false')
  await page.tap('button[aria-controls=menu-sheet]')
  await wait(300)
  await page.keyboard.press('Escape')
  await wait(300)
  check('Escape closes the menu', (await page.getAttribute('button[aria-controls=menu-sheet]', 'aria-expanded')) === 'false')
  await page.tap('button[aria-controls=menu-sheet]')
  await wait(300)
  await page.tap('#menu-sheet a[href="#contact"]')
  await wait(1500)
  check('menu link navigates and closes the menu', (await visibleIn(page, '#contact-title')) && (await page.getAttribute('button[aria-controls=menu-sheet]', 'aria-expanded')) === 'false')

  // Floating WhatsApp: hidden on the hero, shown mid-page, hidden at contact
  const fab = async () => page.evaluate(() => document.querySelector('.wa-float').classList.contains('is-on'))
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await wait(300)
  const a = await fab()
  await page.evaluate(() => scrollTo({ top: document.getElementById('services').offsetTop + 300, behavior: 'instant' })); await wait(300)
  const b = await fab()
  await page.evaluate(() => document.getElementById('contact').scrollIntoView({ behavior: 'instant' })); await wait(400)
  const c = await fab()
  check('floating WhatsApp: off on hero, on mid-page, off at contact', !a && b && !c, `${a},${b},${c}`)
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await wait(500)
  await page.screenshot({ path: `${OUT}/mobile-footer.png` })
  check('mobile: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// --------------------------------------------------------- reduced motion
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await page.evaluate(() => { const s = document.getElementById('process'); scrollTo({ top: s.offsetTop + 200, behavior: 'instant' }) })
  await wait(600)
  const r = await page.evaluate(() => ({
    mark: document.querySelector('.hero__mark').style.transform,
    lid: document.querySelector('.mac__lid').style.transform,
    site: document.querySelector('.scr__site').style.clipPath,
    page: document.querySelector('.ms').style.transform,
  }))
  check('reduced motion: no hero scaling, laptop shown open with the finished site', (r.mark === '' || r.mark === 'none') && /rotateX\(12/.test(r.lid) && r.site === 'none' && /translate3d\(0px, 0(\.00)?%/.test(r.page.replace('0, 0', '0px, 0')), JSON.stringify(r))
  await page.screenshot({ path: `${OUT}/reduced-process.png` })
  check('reduced: no console errors', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// ------------------------------------------------------------ links
{
  const { ctx, page } = await open({ viewport: { width: 1440, height: 900 } })
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => ({ href: a.getAttribute('href'), blank: a.target === '_blank', rel: a.rel })))
  const bad = links.filter(l => {
    if (l.href.startsWith('#')) return false // checked in the page below
    if (l.href.startsWith('tel:')) return l.href !== 'tel:+972538007008'
    if (l.href.startsWith('https://wa.me/')) return !l.href.startsWith('https://wa.me/972538007008')
    if (l.href.startsWith('https://www.instagram.com/')) return l.href !== 'https://www.instagram.com/ar_studio1/'
    if (['https://www.wiserise.co.il/', 'https://www.alumina-group.co.il/', 'https://readytogoo.com/'].includes(l.href)) return false
    return true
  })
  const unsafeBlank = links.filter(l => l.blank && !/noopener/.test(l.rel))
  const anchorsOk = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].every(a => a.getAttribute('href') === '#' || document.querySelector(a.getAttribute('href'))))
  check('every link is an anchor that exists, tel, WhatsApp or Instagram', bad.length === 0 && anchorsOk, JSON.stringify(bad))
  check('external links open safely (noopener)', unsafeBlank.length === 0)
  for (const path of ['/robots.txt', '/sitemap.xml', '/icon.svg']) {
    check(`${path} served`, (await fetch(BASE + path)).ok)
  }
  const head = await fetch(BASE)
  check('security headers set', head.headers.get('x-content-type-options') === 'nosniff' && !!head.headers.get('referrer-policy') && !head.headers.get('x-powered-by'))
  await ctx.close()
}

await browser.close()
const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
