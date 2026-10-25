import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// The hero object: a website in exploded view, as a designer sees it in the
// layers panel. Browser frame, bar, hero image, headlines, button, cards, and
// a phone beside it float apart in depth; the scroll presses them together
// into one finished screen. Design becoming a working site is the studio's
// whole proposition, so the object carries it instead of decorating the page.
//
// Framework-agnostic on purpose: the Next.js page and the static preview both
// mount it the same way. Renders only while visible, pauses with the tab, and
// cleans up everything it creates.

export type Hero3D = { setProgress: (p: number) => void; dispose: () => void; ready: Promise<void> }

type Options = { reduced?: boolean; compact?: boolean }


const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)

// A matcap is a sphere photographed under the studio lights: centre-left is
// the key highlight, the rim picks up a cool edge light. Drawn on a canvas.
export function matcap(stops: string[], rim: string) {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const body = g.createRadialGradient(size * 0.38, size * 0.32, size * 0.02, size * 0.5, size * 0.5, size * 0.52)
  stops.slice().reverse().forEach((col, i, a) => body.addColorStop(i / (a.length - 1), col))
  g.fillStyle = body
  g.fillRect(0, 0, size, size)
  // cool rim light around the lower right edge
  const edge = g.createRadialGradient(size * 0.5, size * 0.5, size * 0.36, size * 0.5, size * 0.5, size * 0.5)
  edge.addColorStop(0, 'rgba(0,0,0,0)')
  edge.addColorStop(1, rim)
  g.globalAlpha = 0.55
  g.globalCompositeOperation = 'screen'
  g.fillStyle = edge
  g.beginPath(); g.arc(size * 0.62, size * 0.6, size * 0.5, 0, Math.PI * 2); g.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

export function mountHero3D(canvas: HTMLCanvasElement, opts: Options = {}): Hero3D {
  const reduced = !!opts.reduced
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
  camera.position.set(0, 0, 16)

  // Matcap materials: the studio lighting is baked into a small texture drawn
  // here, so the shader stays trivial and there is no environment map to
  // build. A pale page, navy lacquer for the image, steel for the bar and
  // cards, gunmetal for the phone and small type.
  const textures = [
    matcap(['#05080d', '#121a26', '#2c3646', '#7b8696', '#d9dfe7'], '#5f7fa3'),
    matcap(['#0d1828', '#172b43', '#2e4a6e', '#7f9bbb', '#e5e9ef'], '#8eabc9'),
    matcap(['#0b1422', '#2f3c50', '#6f7c8f', '#b8c2cf', '#e9edf3'], '#8eabc9'),
    matcap(['#3a4656', '#8e9aaa', '#c5cdd8', '#eef1f5', '#ffffff'], '#c5cdd8'),
  ]
  const [frame, lacquer, steel, pale] = textures.map(t => new THREE.MeshMatcapMaterial({ matcap: t }))

  const geos = new Map<string, THREE.BufferGeometry>()
  const slab = (w: number, h: number, d: number, r: number) => {
    const key = [w, h, d, r].join()
    if (!geos.has(key)) geos.set(key, new RoundedBoxGeometry(w, h, d, 3, r))
    return geos.get(key)!
  }

  type Layer = { mesh: THREE.Object3D; x: number; y: number; z0: number; z1: number; phase: number }
  const layers: Layer[] = []
  const add = (parent: THREE.Group, mesh: THREE.Object3D, x: number, y: number, z0: number, z1: number) => {
    mesh.position.set(x, y, z0)
    parent.add(mesh)
    layers.push({ mesh, x, y, z0, z1, phase: layers.length * 0.7 })
  }

  // The desktop page, laid out right to left like the site itself.
  const page = new THREE.Group()
  add(page, new THREE.Mesh(slab(5.2, 3.5, 0.14, 0.09), pale), 0, 0, 0, 0)
  add(page, new THREE.Mesh(slab(4.9, 0.24, 0.05, 0.05), steel), 0, 1.5, 0.12, 0.6)
  for (let i = 0; i < 3; i++) add(page, new THREE.Mesh(slab(0.09, 0.09, 0.05, 0.04), frame), -2.25 + i * 0.16, 1.5, 0.16, 0.66)
  add(page, new THREE.Mesh(slab(4.9, 1.55, 0.06, 0.07), lacquer), 0, 0.42, 0.12, 1.1)
  add(page, new THREE.Mesh(slab(2.5, 0.2, 0.05, 0.05), pale), 1.05, 0.78, 0.17, 1.75)
  add(page, new THREE.Mesh(slab(1.7, 0.2, 0.05, 0.05), pale), 1.45, 0.45, 0.17, 1.95)
  add(page, new THREE.Mesh(slab(0.95, 0.32, 0.07, 0.15), pale), 1.82, 0.0, 0.18, 2.4)
  for (let i = 0; i < 3; i++) {
    const x = 1.62 - i * 1.62
    add(page, new THREE.Mesh(slab(1.5, 0.95, 0.06, 0.07), steel), x, -1.08, 0.12, 1.15 + i * 0.18)
    add(page, new THREE.Mesh(slab(0.9, 0.1, 0.04, 0.04), frame), x + 0.2, -1.25, 0.16, 1.5 + i * 0.18)
  }

  // The phone, standing in front and to the side of the page.
  const phone = new THREE.Group()
  add(phone, new THREE.Mesh(slab(1.2, 2.4, 0.14, 0.16), frame), 0, 0, 0, 0)
  add(phone, new THREE.Mesh(slab(1.0, 0.9, 0.05, 0.06), lacquer), 0, 0.55, 0.11, 0.7)
  add(phone, new THREE.Mesh(slab(0.7, 0.1, 0.04, 0.04), pale), 0.08, 0.72, 0.15, 1.05)
  add(phone, new THREE.Mesh(slab(0.5, 0.18, 0.05, 0.09), pale), 0.18, -0.15, 0.15, 1.25)
  add(phone, new THREE.Mesh(slab(1.0, 0.55, 0.05, 0.06), steel), 0, -0.75, 0.11, 0.85)

  const group = new THREE.Group()
  group.add(page, phone)
  scene.add(group)
  const compact = !!opts.compact
  page.position.set(compact ? 0.35 : -0.15, 0.3, 0)
  // The phone stands in front of the page's furthest layer, so the two never cross.
  phone.position.set(compact ? -2.3 : -3.05, compact ? -1.1 : -1.3, 2.9)
  phone.scale.setScalar(0.9)
  phone.rotation.y = -0.3

  // Poses of the whole object: tilted back in an exploded three-quarter view,
  // then turned toward the reader as the layers close up.
  const fromRot = new THREE.Euler(-0.38, 0.5, 0.08)
  const toRot = new THREE.Euler(-0.06, 0.16, 0.0)

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let progress = 0, target = 0
  let running = false, visible = true, raf = 0, compiled = false, disposed = false
  const start = performance.now()
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion()

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Keep the whole object inside the frame on narrow canvases.
    camera.position.z = w / h < 0.9 ? 19 : w / h < 1.3 ? 17.5 : 16.5
    camera.updateProjectionMatrix()
  }

  function draw(now: number) {
    const time = reduced ? 0 : (now - start) / 1000
    progress += (target - progress) * (reduced ? 1 : 0.08)
    pointer.x += (pointer.tx - pointer.x) * 0.06
    pointer.y += (pointer.ty - pointer.y) * 0.06
    const u = smooth(clamp01(progress))

    for (const l of layers) {
      // Exploded layers breathe in depth; closed ones sit flush.
      const breathe = reduced ? 0 : Math.sin(time * 0.9 + l.phase) * 0.06 * (1 - u)
      l.mesh.position.z = l.z1 + (l.z0 - l.z1) * u + breathe
    }
    qa.setFromEuler(fromRot)
    qb.setFromEuler(toRot)
    group.quaternion.slerpQuaternions(qa, qb, u)
    group.rotation.y += pointer.x * 0.22 + (reduced ? 0 : Math.sin(time * 0.25) * 0.05 * (1 - u))
    group.rotation.x += -pointer.y * 0.1
    group.position.y = (reduced ? 0 : Math.sin(time * 0.6) * 0.06) + u * 0.1

    renderer.render(scene, camera)
    const settled = reduced || (Math.abs(target - progress) < 0.0005 && Math.abs(pointer.tx - pointer.x) < 0.001 && Math.abs(pointer.ty - pointer.y) < 0.001)
    if (running && !(reduced && settled)) raf = requestAnimationFrame(draw)
    else running = false
  }

  function play() {
    if (!compiled || disposed || running || !visible || document.hidden) return
    running = true
    raf = requestAnimationFrame(draw)
  }

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    pointer.tx = (e.clientX / innerWidth) * 2 - 1
    pointer.ty = -((e.clientY / innerHeight) * 2 - 1)
    play()
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else { running = false; cancelAnimationFrame(raf) } })
  io.observe(canvas)
  const onVis = () => { if (document.hidden) { running = false; cancelAnimationFrame(raf) } else play() }
  const ro = new ResizeObserver(() => { resize(); if (compiled && !running && !disposed) renderer.render(scene, camera) })
  ro.observe(canvas)
  if (!reduced) addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVis)
  resize()
  // Compile every shader off the main thread where the browser allows it,
  // then start drawing; the CSS rendition stays up until this resolves.
  const ready = renderer.compileAsync(scene, camera).catch(() => {}).then(() => { compiled = true; play() })

  return {
    ready,
    setProgress(p: number) {
      target = clamp01(p)
      play()
    },
    dispose() {
      disposed = true
      running = false
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVis)
      geos.forEach(g => g.dispose())
      ;[frame, lacquer, steel, pale].forEach(m => m.dispose())
      textures.forEach(t => t.dispose())
      renderer.dispose()
    },
  }
}
