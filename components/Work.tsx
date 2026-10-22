import Image from 'next/image'
import { showcase, type ShowcaseProject } from '@/lib/work'
import WorkMotion from './WorkMotion'

// Each project on a laptop with a phone leaning into it. With screenshots in
// place, the full page scrolls inside the laptop as the visitor passes. Until
// then the screens carry the project's name: a title card, not a fake site.

function Screen({ p, kind }: { p: ShowcaseProject; kind: 'desktop' | 'mobile' }) {
  const s = kind === 'desktop' ? p.desktop : p.mobile
  if (s) {
    return (
      <Image
        className="device__shot"
        src={s.src}
        width={s.width}
        height={s.height}
        alt={kind === 'desktop' ? `צילום מסך של אתר ${p.name}` : ''}
        sizes={kind === 'desktop' ? '(min-width: 900px) 56vw, 92vw' : '(min-width: 900px) 14vw, 30vw'}
        quality={82}
      />
    )
  }
  return (
    <div className={`device__title device__title--${kind}`} aria-hidden="true">
      <span className="device__name">{p.name}</span>
      <span className="device__domain">{p.domain}</span>
    </div>
  )
}

export default function Work() {
  const items = showcase()
  if (!items.length) return null
  return (
    <section id="work" className="work" data-tone="deep" aria-labelledby="work-title">
      <div className="wrap">
        <header className="work__head" data-sc-in data-sc-stagger="70">
          <h2 id="work-title" className="display display-lg m-0">עבודות נבחרות<span className="gold">.</span></h2>
          <p className="lede m-0">אתרים שבנינו לעסקים אמיתיים. כולם באוויר, ואפשר להיכנס ולראות.</p>
        </header>

        <ol className="projects">
          {items.map((p, i) => (
            <li key={p.id} className={`project${i % 2 ? ' project--flip' : ''}`} data-project>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="project__stage" aria-label={`${p.name}: פתיחת האתר בלשונית חדשה`}>
                <div className="laptop">
                  <div className="laptop__lid">
                    <div className="laptop__screen" data-scroll-screen>
                      <div className="laptop__bar" aria-hidden="true"><i /><i /><i /><span dir="ltr">{p.domain}</span></div>
                      <div className="laptop__view"><Screen p={p} kind="desktop" /></div>
                    </div>
                  </div>
                  <div className="laptop__base" aria-hidden="true" />
                </div>
                <div className="phone" data-depth>
                  <div className="phone__screen"><Screen p={p} kind="mobile" /></div>
                </div>
              </a>

              <div className="project__caption">
                <h3 className="display display-md m-0">{p.name}</h3>
                <p className="project__domain" dir="ltr">{p.domain}</p>
                {(p.field || p.scope) && (
                  <dl className="project__meta">
                    {p.field && <><dt>תחום</dt><dd>{p.field}</dd></>}
                    {p.scope && <><dt>מה עשינו</dt><dd>{p.scope}</dd></>}
                  </dl>
                )}
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="textlink project__link">
                  לצפייה באתר <span className="arrow" aria-hidden="true">←</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <WorkMotion />
    </section>
  )
}
