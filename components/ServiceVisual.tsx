import type { ServiceId } from '@/lib/site'

// One visual per service, drawn in CSS and SVG with the brand tokens. They are
// illustrations of the kind of work, not screenshots of client projects.
export default function ServiceVisual({ id }: { id: ServiceId }) {
  switch (id) {
    case 'websites':
      return (
        <div className="sv sv--websites">
          <div className="sv-browser">
            <div className="sv-browser__bar"><i /><i /><i /></div>
            <div className="sv-browser__body">
              <div className="sv-hero"><b /><b /><span /></div>
              <div className="sv-row"><span /><span /><span /></div>
            </div>
          </div>
          <div className="sv-phone"><div className="sv-hero sv-hero--sm"><b /><b /><span /></div><div className="sv-stack"><span /><span /></div></div>
        </div>
      )
    case 'landing':
      return (
        <div className="sv sv--landing">
          <div className="sv-page">
            <div className="sv-page__hero"><b /><b /></div>
            <div className="sv-page__points"><i /><i /><i /></div>
            <div className="sv-page__form"><span /><span /><em>שליחה</em></div>
          </div>
          <svg className="sv-cursor" viewBox="0 0 24 24"><path d="M5 3l13 7.5-6 1.6-3 5.9z" /></svg>
          <div className="sv-toast"><i />פנייה חדשה</div>
        </div>
      )
    case 'identity':
      return (
        <div className="sv sv--identity">
          <svg className="sv-construct" viewBox="0 0 200 200">
            <rect x="40" y="40" width="120" height="120" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="30" />
            <path d="M40 40l120 120M160 40L40 160M100 20v160M20 100h160" />
            <path className="sv-construct__mark" d="M70 150L100 55l30 95M82 115h36" />
          </svg>
          <div className="sv-swatches"><i style={{ background: 'var(--color-midnight)' }} /><i style={{ background: 'var(--color-navy-secondary)' }} /><i style={{ background: 'var(--color-silver)' }} /><i style={{ background: 'var(--color-off-white)' }} /></div>
          <span className="sv-specimen">אב</span>
        </div>
      )
    case 'cards':
      return (
        <div className="sv sv--cards" data-tilt>
          <div className="sv-card sv-card--back"><span className="sv-card__line" /><span className="sv-card__line sv-card__line--s" /></div>
          <div className="sv-card sv-card--front"><span className="sv-card__mark"><i /><i /><i /></span><span className="sv-card__name" /></div>
        </div>
      )
    case 'digital':
      return (
        <div className="sv sv--digital">
          <div className="sv-form"><span /><span /><span /><em>שליחה</em></div>
          <svg className="sv-flow" viewBox="0 0 120 40"><path d="M4 20h104M100 12l8 8-8 8" /></svg>
          <div className="sv-chat">
            <div className="sv-chat__bubble"><b>פנייה חדשה מהאתר</b><span /><span /></div>
            <div className="sv-chat__bubble sv-chat__bubble--alt"><span /></div>
          </div>
        </div>
      )
    case 'hosting':
      return (
        <div className="sv sv--hosting">
          {['דומיין', 'אחסון', 'עדכוני תוכן', 'תחזוקה שוטפת'].map(l => (
            <div key={l} className="sv-rack"><i /><span>{l}</span><b /></div>
          ))}
        </div>
      )
  }
}
