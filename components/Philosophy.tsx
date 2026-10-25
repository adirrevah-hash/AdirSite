// The pause after the hero: light ground, one statement, three principles.
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
      <div className="wrap">
        <p className="t-label">הגישה</p>
        <h2 id="approach-title" className="t-statement philo__statement" data-reveal="lines">
          <span className="line"><span>אתר טוב לא רק נראה טוב.</span></span>
          <span className="line"><span>הוא מסביר, משכנע,</span></span>
          <span className="line"><span>ומביא את הפנייה הבאה.</span></span>
        </h2>
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
