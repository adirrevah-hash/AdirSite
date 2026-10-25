import * as THREE from 'three'

// The hero object: a fan of thin metal and glass fins that the scroll draws
// into one aligned wall. Parts becoming one brand is the studio's whole
// proposition, so the object carries it instead of decorating the page.
//
// Framework-agnostic on purpose: the Next.js page and the static preview both
// mount it the same way. Renders only while visible, pauses with the tab, and
// cleans up everything it creates.

export type Hero3D = { setProgress: (p: number) => void; dispose: () => void; ready: Promise<void> }

type Options = { reduced?: boolean; fins?: number }


const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)

// A matcap is a sphere photographed under the studio lights: centre-left is
// the key highlight, the rim picks up a cool edge light. Drawn on a canvas.
function matcap(stops: string[], rim: string) {
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
  camera.position.set(0, 0.2, 13)

  // Matcap materials: the studio lighting is baked into a small texture drawn
  // here, so the shader stays trivial and there is no environment map to
  // build. Brushed steel, a darker gunmetal, and dark navy lacquer.
  const steel = matcap(['#0b1422', '#2f3c50', '#6f7c8f', '#b8c2cf', '#e9edf3'], '#8eabc9')
  const gunmetal = matcap(['#06090f', '#1a2433', '#4a5668', '#9aa5b4', '#dfe5ee'], '#5f7fa3')
  const lacquer = matcap(['#04070c', '#0d1828', '#172b43', '#5f7fa3', '#c5cdd8'], '#8eabc9')
  const metal = new THREE.MeshMatcapMaterial({ matcap: steel, side: THREE.DoubleSide })
  const metalDark = new THREE.MeshMatcapMaterial({ matcap: gunmetal, side: THREE.DoubleSide })
  const glass = new THREE.MeshMatcapMaterial({ matcap: lacquer, side: THREE.DoubleSide })

  const N = opts.fins ?? 15
  const W = 0.3, H = 3.9, GAP = 0.07
  // Each fin is a shallow curved blade (a slice of a wide cylinder), so the
  // baked light runs across its face instead of filling it with one tone.
  const R = 0.62, TH = W / R
  const geo = new THREE.CylinderGeometry(R, R, H, 14, 1, true, -TH / 2, TH)
  geo.translate(0, 0, -R)
  const group = new THREE.Group()
  scene.add(group)

  type Fin = { mesh: THREE.Mesh; from: { pos: THREE.Vector3; rot: THREE.Euler }; to: { pos: THREE.Vector3; rot: THREE.Euler }; phase: number }
  const fins: Fin[] = []
  const wallWidth = N * W + (N - 1) * GAP
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const c = t - 0.5
    const mat = i % 4 === 1 ? glass : i % 5 === 3 ? metalDark : metal
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)
    const x = -wallWidth / 2 + W / 2 + i * (W + GAP)
    // Twisted: a louvre wall whose fins turn progressively along its length,
    // on a shallow arc, with a slow wave in height. Parametric, not random.
    const from = {
      pos: new THREE.Vector3(x * 1.08, Math.sin(t * Math.PI) * 0.28 - 0.14, -Math.cos(c * Math.PI) * 0.9 + 0.6),
      rot: new THREE.Euler(0, c * 2.7, c * 0.12),
    }
    // Aligned: one flat wall, every fin facing the viewer.
    const to = { pos: new THREE.Vector3(x, 0, 0), rot: new THREE.Euler(0, 0, 0) }
    fins.push({ mesh, from, to, phase: i * 0.45 })
  }

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
    // Keep the fan inside the frame on narrow canvases.
    camera.position.z = w / h < 0.9 ? 17 : 14.5
    camera.updateProjectionMatrix()
  }

  function frame(now: number) {
    const time = reduced ? 0 : (now - start) / 1000
    progress += (target - progress) * (reduced ? 1 : 0.08)
    pointer.x += (pointer.tx - pointer.x) * 0.06
    pointer.y += (pointer.ty - pointer.y) * 0.06
    const u = smooth(clamp01(progress))

    for (const f of fins) {
      const idle = reduced ? 0 : (1 - u) * Math.sin(time * 0.6 + f.phase) * 0.08
      f.mesh.position.lerpVectors(f.from.pos, f.to.pos, u)
      f.mesh.position.y += idle
      qa.setFromEuler(f.from.rot)
      qb.setFromEuler(f.to.rot)
      f.mesh.quaternion.slerpQuaternions(qa, qb, u)
      if (!reduced) f.mesh.rotateY((1 - u) * Math.sin(time * 0.4 + f.phase) * 0.12)
    }
    group.rotation.y = -0.22 * (1 - u) + pointer.x * 0.28 + (reduced ? 0 : Math.sin(time * 0.15) * 0.06 * (1 - u))
    group.rotation.x = 0.08 + pointer.y * 0.12 - u * 0.12
    group.position.y = u * 0.2

    renderer.render(scene, camera)
    const settled = reduced || (Math.abs(target - progress) < 0.0005 && Math.abs(pointer.tx - pointer.x) < 0.001 && Math.abs(pointer.ty - pointer.y) < 0.001)
    if (running && !(reduced && settled)) raf = requestAnimationFrame(frame)
    else running = false
  }

  function play() {
    if (!compiled || disposed || running || !visible || document.hidden) return
    running = true
    raf = requestAnimationFrame(frame)
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
      geo.dispose(); metal.dispose(); metalDark.dispose(); glass.dispose()
      steel.dispose(); gunmetal.dispose(); lacquer.dispose(); renderer.dispose()
    },
  }
}
