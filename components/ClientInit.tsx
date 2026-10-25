'use client'

import { useEffect } from 'react'

// All interaction lives in framework-free modules (lib/motion). This only
// starts them after hydration and tears them down on unmount.
export default function ClientInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined
    let cancelled = false
    import('@/lib/motion/init').then(m => {
      if (!cancelled) cleanup = m.initSite()
    })
    return () => { cancelled = true; cleanup?.() }
  }, [])
  return null
}
