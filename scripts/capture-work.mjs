// Captures portfolio screenshots for every project in lib/site.ts into
// public/work/<id>-desktop.jpg and <id>-mobile.jpg.
//
//   npm run capture:work            # all projects
//   npm run capture:work wiserise   # one project
//
// Capturing a site does not publish it: a project only appears on the page
// once `verified: true`, `scope` and `image` are filled in lib/site.ts.
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
      await page.screenshot({ path: out, type: 'jpeg', quality: 86 })
      console.log('saved', out)
    } catch (e) {
      console.error(`failed ${p.id} (${kind}): ${e.message.split('\n')[0]}`)
    }
    await ctx.close()
  }
}
await browser.close()
