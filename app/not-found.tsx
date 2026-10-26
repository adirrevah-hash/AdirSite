import type { Metadata } from 'next'
import { site, whatsappUrl } from '@/lib/site'
import A11yFloat from '@/components/A11yFloat'

export const metadata: Metadata = { title: `העמוד לא נמצא | ${site.name}`, robots: { index: false } }

// A missing address: the brand, a plain explanation and the way back.
export default function NotFound() {
  return (
    <>
      <main id="main" className="nf on-dark bg-midnight">
        <div className="wrap nf__inner">
          <a href="/" className="wordmark" aria-label={`${site.name}, לדף הבית`}>
            <span className="wordmark__mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="wordmark__text">{site.name}</span>
          </a>
          <p className="nf__code num" aria-hidden="true">404</p>
          <h1 className="t-h2">העמוד הזה לא נמצא</h1>
          <p className="t-lede">ייתכן שהקישור שגוי או שהעמוד הועבר. כל מה שצריך נמצא בדף הבית.</p>
          <div className="nf__actions">
            <a href="/" className="btn btn--light">חזרה לדף הבית <span className="btn__arrow" aria-hidden="true">←</span></a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">כתבו לנו בוואטסאפ</a>
          </div>
        </div>
      </main>
      <A11yFloat />
    </>
  )
}
