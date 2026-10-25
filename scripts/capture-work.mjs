// Captures portfolio screenshots for every project in lib/site.ts into
// public/work/<id>-desktop.jpg and <id>-mobile.jpg.
//
//   npm run capture:work            # all projects
//   npm run capture:work wiserise   # one project
//
// Desktop is captured full-page (it scrolls inside the laptop on the site),
// mobile as one phone screen. Rebuild after capturing; the page picks the
// files up by name.
import { chromium } from 'playwright-core'
import { readFileSync, mkdirSync } from 'node:fs'

const src = readFileSync(new URL('../lib/site.ts', import.meta.url), 'utf8')
const all = [...src.matchAll(/\{ id: '([^']+)', name: '[^']*', url: '([^']+)'/g)].map(m => ({ id: m[1], url: m[2] }))
const only = process.argv[2]
const projects = only ? all.filter(p => p.id === only) : all
if (!projects.length) { console.error('No matching projects in lib/site.ts'); process.exit(1) }

mkdirSync(new URL('../public/work/', import.meta.url), { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })

for (const p of projects) {
  for (const [kind, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, locale: 'he-IL' })
    const page = await ctx.newPage()
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 45000 })
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(1500) // let entrance animations settle
      const out = `public/work/${p.id}-${kind}.jpg`
      if (mobile) {
        await page.screenshot({ path: out, type: 'jpeg', quality: 84 })
      } else {
        // Scroll through once so lazy images and reveal animations load, then
        // capture up to five screens of the page.
        const h = await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) }
          scrollTo(0, 0); await new Promise(r => setTimeout(r, 400))
          return document.documentElement.scrollHeight
        })
        await page.screenshot({ path: out, type: 'jpeg', quality: 80, fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height: Math.min(h, viewport.height * 5) } })
      }
      console.log('saved', out)
    } catch (e) {
      console.error(`failed ${p.id} (${kind}): ${e.message.split('\n')[0]}`)
    }
    await ctx.close()
  }
}
await browser.close()
