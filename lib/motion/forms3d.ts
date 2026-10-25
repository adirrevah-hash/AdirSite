import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { matcap } from './hero3d'

// The approach section's object: the three principles as three forms. A
// sphere (clear), a cube (precise) and a plus (measured) start scattered and
// come together, as the reader scrolls, into one balanced sculpture: the
// sphere resting on the cube, the plus leaning beside them.
// Renders only while visible and in motion; cleans up everything it creates.

export type Forms3D = { setProgress: (p: number) => void; dispose: () => void; ready: Promise<void> }

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)

export function mountForms3D(canvas: HTMLCanvasElement, opts: { reduced?: boolean } = {}): Forms3D {
  const reduced = !!opts.reduced
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0.6, 12)
  camera.lookAt(0, -0.2, 0)

  // Darker finishes than the hero's: they sit on the light ground.
  const navyTex = matcap(['#03060b', '#0d1828', '#172b43', '#4f6a8c', '#c5cdd8'], '#8eabc9')
  const steelTex = matcap(['#141a22', '#3a4656', '#7d8999', '#c3cbd6', '#f3f5f8'], '#8eabc9')
  const graphiteTex = matcap(['#050608', '#171a20', '#3a404c', '#8e9aaa', '#e5e9ef'], '#5f7fa3')
  const navy = new THREE.MeshMatcapMaterial({ matcap: navyTex })
  const steel = new THREE.MeshMatcapMaterial({ matcap: steelTex })
  const graphite = new THREE.MeshMatcapMaterial({ matcap: graphiteTex })

  const sphereGeo = new THREE.SphereGeometry(0.95, 64, 48)
  const cubeGeo = new RoundedBoxGeometry(1.75, 1.75, 1.75, 5, 0.16)
  const barGeo = new RoundedBoxGeometry(2.3, 0.5, 0.5, 4, 0.12)

  const sphere = new THREE.Mesh(sphereGeo, navy)
  const cube = new THREE.Mesh(cubeGeo, steel)
  const plus = new THREE.Group()
  // A three-axis plus, like a transform gizmo: one bar per axis.
  const barX = new THREE.Mesh(barGeo, graphite)
  const barY = new THREE.Mesh(barGeo, graphite); barY.rotation.z = Math.PI / 2
  const barZ = new THREE.Mesh(barGeo, graphite); barZ.rotation.y = Math.PI / 2
  plus.add(barX, barY, barZ)

  // A soft contact shadow under the sculpture.
  const sc = document.createElement('canvas')
  sc.width = sc.height = 128
  const sg = sc.getContext('2d')!
  const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(9,19,33,0.5)'); grad.addColorStop(1, 'rgba(9,19,33,0)')
  sg.fillStyle = grad; sg.fillRect(0, 0, 128, 128)
  const shadowTex = new THREE.CanvasTexture(sc)
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  const shadowGeo = new THREE.PlaneGeometry(5.5, 2.6)
  const shadow = new THREE.Mesh(shadowGeo, shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(0.4, -1.92, 0)

  const group = new THREE.Group()
  group.add(sphere, cube, plus, shadow)
  scene.add(group)

  type Pose = { pos: THREE.Vector3; rot: THREE.Euler }
  const forms: Array<{ obj: THREE.Object3D; from: Pose; to: Pose; phase: number; spin: number }> = [
    { obj: cube, phase: 0, spin: 0.25,
      from: { pos: new THREE.Vector3(2.1, 1.9, -1.6), rot: new THREE.Euler(0.9, 0.7, 0.4) },
      to: { pos: new THREE.Vector3(-0.2, -1.0, 0), rot: new THREE.Euler(0, Math.PI / 4, 0) } },
    { obj: sphere, phase: 1.3, spin: 0,
      from: { pos: new THREE.Vector3(-2.3, 2.0, -0.6), rot: new THREE.Euler(0, 0, 0) },
      to: { pos: new THREE.Vector3(-0.2, 0.83, 0), rot: new THREE.Euler(0, 0, 0) } },
    { obj: plus, phase: 2.4, spin: 0.6,
      from: { pos: new THREE.Vector3(-1.6, -2.1, 1.2), rot: new THREE.Euler(0.6, -0.4, 0.9) },
      to: { pos: new THREE.Vector3(1.85, -0.95, 0.7), rot: new THREE.Euler(0.35, 0.6, 0.25) } },
  ]

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let progress = 0, target = 0
  let running = false, visible = false, raf = 0, compiled = false, disposed = false
  const start = performance.now()
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion()

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.position.z = w / h < 1 ? 14 : 12
    camera.updateProjectionMatrix()
  }

  function frame(now: number) {
    const time = reduced ? 0 : (now - start) / 1000
    progress += (target - progress) * (reduced ? 1 : 0.07)
    pointer.x += (pointer.tx - pointer.x) * 0.05
    pointer.y += (pointer.ty - pointer.y) * 0.05
    const u = smooth(clamp01(progress))

    for (const f of forms) {
      f.obj.position.lerpVectors(f.from.pos, f.to.pos, u)
      // Scattered forms drift; assembled ones only breathe.
      f.obj.position.y += Math.sin(time * 0.8 + f.phase) * (0.12 * (1 - u) + 0.03)
      qa.setFromEuler(f.from.rot)
      qb.setFromEuler(f.to.rot)
      f.obj.quaternion.slerpQuaternions(qa, qb, u)
      if (f.spin) f.obj.rotateY(time * f.spin * (1 - u * 0.85))
    }
    shadowMat.opacity = 0.25 + u * 0.75
    group.rotation.y = pointer.x * 0.35 + (reduced ? 0 : Math.sin(time * 0.2) * 0.08)
    group.rotation.x = -pointer.y * 0.12

    renderer.render(scene, camera)
    if (running && !reduced) raf = requestAnimationFrame(frame)
    else running = false
  }

  function play() {
    if (!compiled || disposed || running || !visible || document.hidden) return
    running = true
    raf = requestAnimationFrame(frame)
  }
  const stop = () => { running = false; cancelAnimationFrame(raf) }

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    pointer.tx = (e.clientX / innerWidth) * 2 - 1
    pointer.ty = -((e.clientY / innerHeight) * 2 - 1)
  }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); else stop() })
  io.observe(canvas)
  const onVis = () => { if (document.hidden) stop(); else play() }
  const ro = new ResizeObserver(() => { resize(); if (compiled && !running && !disposed) renderer.render(scene, camera) })
  ro.observe(canvas)
  if (!reduced) addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVis)
  resize()
  const ready = renderer.compileAsync(scene, camera).catch(() => {}).then(() => { compiled = true; play() })

  return {
    ready,
    setProgress(p: number) {
      target = clamp01(p)
      if (reduced && compiled) { running = true; frame(performance.now()) }
    },
    dispose() {
      disposed = true
      stop()
      io.disconnect(); ro.disconnect()
      removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVis)
      sphereGeo.dispose(); cubeGeo.dispose(); barGeo.dispose(); shadowGeo.dispose()
      navy.dispose(); steel.dispose(); graphite.dispose(); shadowMat.dispose()
      navyTex.dispose(); steelTex.dispose(); graphiteTex.dispose(); shadowTex.dispose()
      renderer.dispose()
    },
  }
}
