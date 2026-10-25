// Small 3D forms drawn in CSS: a sphere with an orbit ring, a cube, and a
// three-axis plus. They turn slowly in place. Decorative.
export type Obj3DKind = 'sphere' | 'cube' | 'plus'

export default function Obj3D({ kind, className = '' }: { kind: Obj3DKind; className?: string }) {
  return (
    <span className={`obj3d obj3d--${kind} ${className}`} aria-hidden="true">
      <span className="obj3d__rot">
        {kind === 'sphere' && <><i className="obj3d__ball" /><i className="obj3d__ring" /></>}
        {kind === 'cube' && <>{['f', 'b', 'r', 'l', 't', 'd'].map(f => <i key={f} className={`obj3d__face obj3d__face--${f}`} />)}</>}
        {kind === 'plus' && <>{['x1', 'x2', 'y1', 'y2', 'z1', 'z2'].map(b => <i key={b} className={`obj3d__bar obj3d__bar--${b}`} />)}</>}
      </span>
    </span>
  )
}
