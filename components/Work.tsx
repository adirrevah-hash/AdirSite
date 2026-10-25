import Image from 'next/image'
import { showcase, type ShowcaseProject } from '@/lib/work'
import { IconClose, IconExternal } from './icons'

// The gallery. Each project sits in a desktop frame with a phone leaning into
// it, in an editorial, uneven layout. A project opens into a dialog with the
// larger views and the project notes. Until screenshots are captured, the
// screens carry a title card that says so plainly.

function Screen({ p, kind, large }: { p: ShowcaseProject; kind: 'desktop' | 'mobile'; large?: boolean }) {
  const s = kind === 'desktop' ? p.desktop : p.mobile
  if (s) {
    return (
      <Image
        className="shot"
        src={s.src}
        width={s.width}
        height={s.height}
        alt={kind === 'desktop' ? `צילום מסך של האתר ${p.name}` : `צילום מסך של ${p.name} בטלפון`}
        sizes={large ? '(min-width: 1024px) 60vw, 100vw' : kind === 'desktop' ? '(min-width: 1024px) 50vw, 92vw' : '(min-width: 1024px) 14vw, 30vw'}
        quality={82}
      />
    )
  }
  return (
    <div className={`shot-pending shot-pending--${kind}`}>
      <span className="shot-pending__name">{p.name}</span>
      <span className="shot-pending__note">צילום מסך יתווסף</span>
    </div>
  )
}

function Devices({ p, large }: { p: ShowcaseProject; large?: boolean }) {
  return (
    <div className="devices">
      <div className="device-desk">
        <div className="device-desk__bar" aria-hidden="true"><i /><i /><i /><span className="num">{p.domain}</span></div>
        <div className="device-desk__screen" data-parallax-screen><Screen p={p} kind="desktop" large={large} /></div>
      </div>
      <div className="device-phone">
        <div className="device-phone__screen"><Screen p={p} kind="mobile" large={large} /></div>
      </div>
    </div>
  )
}

export default function Work() {
  const items = showcase()
  return (
    <section id="work" className="work on-dark bg-graphite" aria-labelledby="work-title">
      <div className="wrap">
        <header className="work__head">
          <div>
            <p className="t-label">עבודות נבחרות</p>
            <h2 id="work-title" className="t-h2" data-reveal="lines">
              <span className="line"><span>אתרים שבנינו</span></span>
              <span className="line"><span>לעסקים אמיתיים.</span></span>
            </h2>
          </div>
          <p className="work__count"><span className="num">{String(items.length).padStart(2, '0')}</span> פרויקטים באוויר</p>
        </header>

        <div className="work__grid">
          {items.map((p, i) => (
            <article key={p.id} className={`project project--${i}`} data-reveal="mask">
              <button type="button" className="project__stage" data-dialog={`dlg-${p.id}`} aria-haspopup="dialog" aria-label={`פרטי הפרויקט ${p.name}`}>
                <Devices p={p} />
                <span className="project__hint" aria-hidden="true">פרטי הפרויקט</span>
              </button>
              <div className="project__caption">
                <h3 className="t-h3">{p.name}</h3>
                <p className="project__meta"><span className="num">{p.domain}</span><span aria-hidden="true">·</span>{p.kind}</p>
                <div className="project__actions">
                  <button type="button" className="link" data-dialog={`dlg-${p.id}`} aria-haspopup="dialog">פרטי הפרויקט</button>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="link">לאתר <IconExternal width={16} height={16} /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {items.map(p => (
        <dialog key={p.id} id={`dlg-${p.id}`} className="pdialog on-dark" aria-labelledby={`dlg-${p.id}-title`}>
          <div className="pdialog__panel">
            <header className="pdialog__head">
              <div>
                <p className="t-label">פרויקט</p>
                <h3 id={`dlg-${p.id}-title`} className="t-h2">{p.name}</h3>
              </div>
              <button type="button" className="pdialog__close" data-dialog-close aria-label="סגירה"><IconClose width={22} height={22} /></button>
            </header>
            <div className="pdialog__media"><Devices p={p} large /></div>
            <dl className="pdialog__facts">
              <div><dt>סוג</dt><dd>{p.kind}</dd></div>
              <div><dt>כתובת</dt><dd><a href={p.url} target="_blank" rel="noopener noreferrer" className="link"><span className="num">{p.domain}</span> <IconExternal width={16} height={16} /></a></dd></div>
              <div><dt>מטרת הפרויקט</dt><dd>{p.goal || <span className="pending">יתווסף בקרוב</span>}</dd></div>
              <div><dt>מה סופק</dt><dd>{p.delivered?.length ? p.delivered.join(' · ') : <span className="pending">יתווסף בקרוב</span>}</dd></div>
            </dl>
          </div>
        </dialog>
      ))}
    </section>
  )
}
