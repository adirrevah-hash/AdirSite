// A small scene per commitment, drawn in HTML and CSS: each one acts out its
// card's promise. Decorative; the card's heading and text carry the meaning.
export type DiffKind = 'build' | 'phone' | 'lead' | 'brand'

function Mark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return <span className={`dv-mark dv-mark--${size}`}><i /><i /><i /><i /></span>
}

export default function DiffVisual({ kind }: { kind: DiffKind }) {
  return (
    <div className={`dv dv--${kind}`} aria-hidden="true" data-dv>
      {kind === 'build' && (
        // A page assembling from its parts, piece by piece.
        <div className="dv-win">
          <i className="dv-bar"><b /><b /><b /></i>
          <div className="dv-build"><b className="p1" /><b className="p2" /><b className="p3" /><b className="p4" /></div>
        </div>
      )}
      {kind === 'phone' && (
        // The same page narrowing from a desktop to a phone; its blocks reflow.
        <div className="dv-resize">
          <div className="dv-frame">
            <i className="dv-bar"><b /><b /><b /></i>
            <div className="dv-flow"><b className="wide" /><b /><b /><b /><b /></div>
          </div>
        </div>
      )}
      {kind === 'lead' && (
        // A filled form sends a dot along the line; it lands as a chat bubble.
        <div className="dv-lead">
          <div className="dv-form"><i /><i /><em /></div>
          <span className="dv-path"><span className="dv-dot" /></span>
          <div className="dv-phone">
            <span className="dv-bubble"><i /><i /></span>
            <span className="dv-badge" />
          </div>
        </div>
      )}
      {kind === 'brand' && (
        // One mark, carried to a business card, a site and a phone.
        <div className="dv-brand">
          <Mark size="lg" />
          <span className="dv-lines"><i /><i /><i /></span>
          <div className="dv-items">
            <span className="dv-item dv-item--card"><Mark /></span>
            <span className="dv-item dv-item--site"><Mark /></span>
            <span className="dv-item dv-item--phone"><Mark /></span>
          </div>
        </div>
      )}
    </div>
  )
}
