import type { Metadata, Viewport } from 'next'
import './globals.css'
import './sections.css'
import './motion.css'
import { site } from '@/lib/site'
import ClientInit from '@/components/ClientInit'
import Intro from '@/components/Intro'

// Before first paint: apply the visitor's saved accessibility choices, and
// decide whether this visit opens with the intro (on the home page only, and
// never when motion is off).
const introScript = `try{var h=document.documentElement,a=JSON.parse(localStorage.getItem('ar-a11y')||'{}');if(a.text)h.classList.add('a11y-text-'+a.text);['contrast','links','font','still'].forEach(function(k){if(a[k])h.classList.add('a11y-'+k)});if(location.pathname==='/'&&!a.still&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('ar-intro')){h.classList.add('has-intro');sessionStorage.setItem('ar-intro','1')}}catch(e){}`

const title = 'ARStudio | אתרי תדמית, דפי נחיתה וזהות חזותית'

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url), alternates: { canonical: '/' } } : {}),
  title,
  description: site.description,
  openGraph: {
    type: 'website', locale: 'he_IL', siteName: site.name, title, description: site.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ARStudio: נוכחות דיגיטלית שמביאה תוצאות' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = { themeColor: '#091321', width: 'device-width', initialScale: 1, viewportFit: 'cover' }

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  description: site.description,
  telephone: site.phone.tel,
  areaServed: { '@type': 'Country', name: 'Israel' },
  sameAs: [site.instagram.url],
  ...(site.url ? { url: site.url } : {}),
  ...(site.email ? { email: site.email } : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <link rel="preload" href="/fonts/noto-hebrew-he.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/noto-hebrew-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/plex-hebrew-400-he.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/plex-hebrew-600-he.woff2" as="font" type="font/woff2" crossOrigin="" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      </head>
      <body>
        <Intro />
        <a className="skip-link" href="#main">דילוג לתוכן</a>
        {children}
        <ClientInit />
      </body>
    </html>
  )
}
