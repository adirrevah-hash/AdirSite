// Renders the share image (public/og.jpg, 1200x630) from the site's own fonts,
// palette and hero scene. Run against a running build:
//   npm start   then   node scripts/og-image.mjs
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const EXE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium'

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Display'; src: url(/fonts/noto-hebrew-he.woff2) format('woff2'); font-weight: 100 900; unicode-range: U+0590-05FF; }
@font-face { font-family: 'Display'; src: url(/fonts/noto-hebrew-latin.woff2) format('woff2'); font-weight: 100 900; unicode-range: U+0000-00FF, U+2000-206F; }
@font-face { font-family: 'Text'; src: url(/fonts/plex-hebrew-400-he.woff2) format('woff2'); font-weight: 400; unicode-range: U+0590-05FF; }
@font-face { font-family: 'Text'; src: url(/fonts/plex-hebrew-400-latin.woff2) format('woff2'); font-weight: 400; unicode-range: U+0000-00FF, U+2000-206F; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #091321; color: #F5F6F8; font-family: 'Text', sans-serif; position: relative; }
.art { position: absolute; left: 0; top: 0; height: 630px; width: 720px; object-fit: cover; object-position: center;
  -webkit-mask-image: linear-gradient(to left, transparent 0%, #000 45%); mask-image: linear-gradient(to left, transparent 0%, #000 45%); opacity: 0.95; }
.copy { position: absolute; right: 80px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; gap: 26px; }
.mark { display: flex; align-items: center; gap: 14px; font: 600 34px 'Display'; letter-spacing: -0.01em; }
.mark i { display: inline-block; width: 4px; height: 30px; border-radius: 2px; background: #C5CDD8; margin-left: 5px; }
.mark i:nth-child(2) { opacity: .75 } .mark i:nth-child(3) { opacity: .5 } .mark i:nth-child(4) { opacity: .3 }
h1 { font: 500 76px/1.02 'Display'; letter-spacing: -0.025em; }
h1 span { display: block; background: linear-gradient(90deg, #5585D6, #9DB8E3); -webkit-background-clip: text; background-clip: text; color: transparent; }
p { font-size: 27px; color: #C5CDD8; }
.rule { width: 72px; height: 1px; background: #8E9AAA; }
</style></head><body>
<img class="art" src="/hero/scene-desktop.jpg" alt="">
<div class="copy">
  <div class="mark"><span><i></i><i></i><i></i><i></i></span><span dir="ltr">ARStudio</span></div>
  <h1>נוכחות דיגיטלית<span>שמביאה תוצאות</span></h1>
  <div class="rule"></div>
  <p>אתרי תדמית · דפי נחיתה · זהות חזותית</p>
</div></body></html>`

const browser = await chromium.launch({ executablePath: EXE })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
// Served from the site's own origin, so its fonts and images load.
await page.route(`${BASE}/__og`, r => r.fulfill({ status: 200, contentType: 'text/html', body: html }))
await page.goto(`${BASE}/__og`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 86 })
await browser.close()
console.log('wrote public/og.jpg')
