// The opening sequence: the louvre mark draws, the name lands, a count runs
// to 100, then the cover lifts away bar by bar onto the hero. CSS only, shown
// once per visit and never for reduced motion (see the script in the layout).
export default function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__bars">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ['--b' as string]: i }} />)}</div>
      <div className="intro__center">
        <span className="intro__mark"><i /><i /><i /><i /></span>
        <span className="intro__word">{[...'ARStudio'].map((ch, i) => <span key={i} style={{ ['--l' as string]: i }}>{ch}</span>)}</span>
      </div>
      <span className="intro__count num" />
      <span className="intro__tag">סטודיו לעיצוב ובניית אתרים</span>
    </div>
  )
}
