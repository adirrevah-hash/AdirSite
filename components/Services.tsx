import { services, CTA_LABEL, type ServiceId } from '@/lib/site'

// One continuous line drawing per service, drawn in the same hand. They draw
// themselves once as the row arrives; they are diagrams, not screenshots.
function Art({ id }: { id: ServiceId }) {
  const common = { className: 'svc__art draw', viewBox: '0 0 144 96', 'aria-hidden': true as const }
  switch (id) {
    case 'website':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="136" height="84" rx="6" pathLength={1} />
          <path d="M4 20h136" pathLength={1} />
          <path d="M16 36h58M16 46h40" pathLength={1} />
          <rect x="16" y="58" width="34" height="20" rx="3" pathLength={1} />
          <rect x="86" y="32" width="42" height="46" rx="3" pathLength={1} />
          <path d="M86 32l42 46M128 32L86 78" pathLength={1} />
        </svg>
      )
    case 'landing':
      return (
        <svg {...common}>
          <rect x="44" y="2" width="56" height="92" rx="6" pathLength={1} />
          <path d="M54 18h36M54 26h24" pathLength={1} />
          <rect x="54" y="38" width="36" height="22" rx="3" pathLength={1} />
          <rect x="54" y="70" width="36" height="12" rx="6" pathLength={1} />
          <path d="M108 76h26M126 68l8 8-8 8" pathLength={1} />
        </svg>
      )
    case 'logo':
      return (
        <svg {...common}>
          <rect x="34" y="6" width="76" height="76" pathLength={1} />
          <circle cx="72" cy="44" r="38" pathLength={1} />
          <path d="M34 6l76 76M110 6L34 82" pathLength={1} />
          <circle cx="72" cy="44" r="14" pathLength={1} />
          <path d="M20 44h104M72 0v92" pathLength={1} />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="20" y="22" width="86" height="54" rx="4" pathLength={1} transform="rotate(-6 63 49)" />
          <rect x="38" y="30" width="86" height="54" rx="4" pathLength={1} />
          <path d="M50 44h30M50 52h20" pathLength={1} />
          <circle cx="108" cy="70" r="6" pathLength={1} />
        </svg>
      )
  }
}

export default function Services() {
  return (
    <section id="services" className="services" data-tone="blue" aria-labelledby="services-title">
      <div className="wrap">
        <ul className="list-none p-0 m-0">
          {services.map(s => (
            <li key={s.id} className="svc" data-sc-in>
              <div className="svc__row">
                <h3 className="svc__title display m-0">{s.title}</h3>
                <div>
                  <p className="svc__line">{s.line}</p>
                  <ul className="svc__includes" aria-label={`מה כולל: ${s.title}`}>
                    {s.includes.map(i => <li key={i}>{i}</li>)}
                  </ul>
                  <a href="#contact" data-service={s.id} className="svc__cta textlink">
                    {CTA_LABEL} על {s.title}
                    <span className="arrow" aria-hidden="true"> ←</span>
                  </a>
                </div>
                <Art id={s.id} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
