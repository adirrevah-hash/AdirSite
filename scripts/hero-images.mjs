// Writes the hero scene in AVIF and WebP, plus a narrower phone size, next to
// the JPEGs in public/hero. Run after replacing a scene:  node scripts/hero-images.mjs
import sharp from 'sharp'

const jobs = [
  ['scene-desktop', [950]],
  ['scene-mobile', [640, 940]],
]
for (const [name, widths] of jobs) {
  const src = `public/hero/${name}.jpg`
  for (const w of widths) {
    const base = `public/hero/${name}${w === widths[widths.length - 1] ? '' : `-${w}`}`
    const img = sharp(src).resize({ width: w, withoutEnlargement: true })
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`)
    await img.clone().webp({ quality: 76 }).toFile(`${base}.webp`)
    if (w !== widths[widths.length - 1]) await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${base}.jpg`)
  }
}
console.log('hero images written')
