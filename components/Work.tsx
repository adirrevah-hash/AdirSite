import Image from 'next/image'
import { shownProjects } from '@/lib/site'

// Renders only projects the studio has confirmed (verified + scope + image in
// lib/site.ts). With none confirmed, the section and its nav link are absent
// rather than filled with anything unproven.
export default function Work() {
  if (!shownProjects.length) return null
  return (
    <section id="work" className="work" data-tone="paper" aria-labelledby="work-title">
      <div className="wrap">
        <h2 id="work-title" className="display display-lg" data-sc-in>עבודות נבחרות.</h2>
        {shownProjects.map((p, i) => (
          <article key={p.id} className="project" data-sc-in>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="project__shot block" aria-label={`${p.name}, פתיחת האתר בלשונית חדשה`}>
              <Image src={p.image!.desktop} alt={p.image!.alt} width={1440} height={900} sizes="(min-width: 900px) 62vw, 100vw" priority={i === 0} />
            </a>
            <div>
              <h3 className="display display-md m-0">{p.name}</h3>
              <dl className="project__label mt-5">
                <dt>תחום</dt><dd>{p.field}</dd>
                <dt>מה עשינו</dt><dd>{p.scope}</dd>
              </dl>
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="textlink">לאתר <span className="arrow" aria-hidden="true">←</span></a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
