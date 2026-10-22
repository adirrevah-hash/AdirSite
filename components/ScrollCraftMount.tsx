'use client'

import Script from 'next/script'

declare global {
  interface Window {
    ScrollCraft?: { mount: (root: Element) => unknown; reduce: boolean; instances: unknown[] }
  }
}

// The scroll-craft engine is a vanilla runtime that reads data-sc-* attributes
// off server-rendered markup. It loads after hydration and mounts once; the
// page is fully readable before it runs, and stays readable if it never does.
export default function ScrollCraftMount() {
  return (
    <Script
      src="/scrollcraft.js"
      strategy="afterInteractive"
      onReady={() => {
        const sc = window.ScrollCraft
        if (!sc || sc.instances.length) return
        sc.mount(document.body)
        window.dispatchEvent(new Event('scrollcraft:ready'))
      }}
    />
  )
}
