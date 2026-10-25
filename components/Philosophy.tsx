import Blueprint from './Blueprint'
import Split from './Split'

// The pause after the hero: light ground, one statement, three principles.
// With motion the statement holds in place and fills in word by word as the
// reader scrolls, so it is read at the pace it was written. A selection box,
// as in a design tool, frames it with its live measurements.
const principles = [
  { glyph: 'circle', title: 'ברור לפני יפה', text: 'כל עמוד מתחיל בשאלה מה הגולש צריך להבין ומה הוא צריך לעשות. העיצוב בא לשרת את התשובה.' },
  { glyph: 'square', title: 'הדיוק בפרטים', text: 'ריווח, טיפוגרפיה ותנועה הם מה שמבדיל אתר מקצועי מתבנית. כל אחד מהם נבחר במכוון.' },
  { glyph: 'line', title: 'נמדד בתוצאה', text: 'אתר נבחן במה שהוא עושה: כמה ברור הוא, כמה מהר הוא נטען, וכמה פניות הוא מביא.' },
] as const

function Glyph({ kind }: { kind: 'circle' | 'square' | 'line' }) {
  return (
    <svg className="principle__glyph" viewBox="0 0 40 40" aria-hidden="true">
      {kind === 'circle' && <circle cx="20" cy="20" r="13" />}
      {kind === 'square' && <rect x="8" y="8" width="24" height="24" rx="2" />}
      {kind === 'line' && <path d="M6 20h28M20 6v28" />}
    </svg>
  )
}

export default function Philosophy() {
  return (
    <section id="approach" className="philo on-light bg-off-white" aria-labelledby="approach-title" data-philo>
      <Blueprint />
      <div className="wrap">
        <div className="philo__pin" data-fill-pin>
          <p className="t-label">הגישה</p>
          <div className="select-box" data-select>
            <h2 id="approach-title" className="t-statement philo__statement" data-fill>
              <span className="stmt-line"><Split by="words" text="אתר טוב לא רק נראה טוב." /></span>
              <span className="stmt-line"><Split by="words" text="הוא מסביר, משכנע," /></span>
              <span className="stmt-line"><Split by="words" text="ומביא את הפנייה הבאה." /></span>
            </h2>
            <span className="select-box__frame" aria-hidden="true"><i /><i /><i /><i /></span>
            <span className="select-box__tag num" aria-hidden="true" data-select-size>H2</span>
          </div>
        </div>
        <div className="philo__grid" data-reveal="fade">
          {principles.map(p => (
            <div key={p.title} className="principle">
              <Glyph kind={p.glyph} />
              <h3 className="t-h3">{p.title}</h3>
              <p className="t-body">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
