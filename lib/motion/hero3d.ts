import * as THREE from 'three'

// Shared WebGL helpers: the studio's baked matcap lighting and a WebGL check.

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
