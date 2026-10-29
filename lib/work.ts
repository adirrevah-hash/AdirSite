import fs from 'node:fs'
import path from 'node:path'
import { projects, type Project } from './site'

// Build-time lookup of each project's screenshots in /public/work. Reading the
// real pixel size lets the page reserve exactly the right space for them.

export type Shot = { src: string; width: number; height: number }
export type ShowcaseProject = Project & { domain: string; desktop?: Shot; mobile?: Shot }

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    // SOF0..SOF15, excluding DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    i += 2 + len
  }
  return null
}

function shot(id: string, kind: 'desktop' | 'mobile'): Shot | undefined {
  const file = path.join(process.cwd(), 'public', 'work', `${id}-${kind}.jpg`)
  if (!fs.existsSync(file)) return undefined
  const size = jpegSize(fs.readFileSync(file))
  return size ? { src: `/work/${id}-${kind}.jpg`, ...size } : undefined
}

export function showcase(): ShowcaseProject[] {
  return projects.map(p => ({
    ...p,
    domain: p.url ? new URL(p.url).hostname.replace(/^www\./, '') : '',
    desktop: shot(p.id, 'desktop'),
    mobile: shot(p.id, 'mobile'),
  }))
}
