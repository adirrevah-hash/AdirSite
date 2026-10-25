import Blueprint from './Blueprint'
import DiffVisual from './DiffVisual'
import Split from './Split'

const items = [
  { kind: 'build', title: 'אתר שנבנה לעסק שלכם', text: 'מבנה, תוכן ועיצוב שנקבעים לפי העסק והקהל שלו, לא לפי תבנית מוכנה.' },
  { kind: 'phone', title: 'מותאם לטלפון מהיום הראשון', text: 'כל מסך מתוכנן גם לנייד, וכל כפתור נוח ללחיצה באגודל.' },
  { kind: 'lead', title: 'פניות שמגיעות אליכם', text: 'טופס ווואטסאפ מחוברים ונבדקים לפני ההשקה, כדי שאף פנייה לא תלך לאיבוד.' },
  { kind: 'brand', title: 'שפה חזותית אחת', text: 'אותו מותג מהלוגו, דרך כרטיס הביקור ועד האתר.' },
] as const

// Four commitments as a row of cards that travels sideways while the section
// holds, like the services; without motion they sit in a plain grid. Each card
// opens on a small scene that acts out its promise.
export default function Difference() {
  const total = String(items.length).padStart(2, '0')
  return (
    <section id="difference" className="diff on-light bg-off-white" aria-labelledby="diff-title">
      <Blueprint />
      <div className="diff__room x-room">
        <div className="diff__pin x-pin">
          <p className="ghost-word diff__ghost" aria-hidden="true" data-ghost>בנויים בדיוק</p>
          <div className="glass-orbs" aria-hidden="true"><i /><i /><i /></div>
          <div className="diff__track x-track">
            <header className="diff__head">
              <p className="t-label">ההבדל</p>
              <h2 id="diff-title" className="t-h2" data-reveal="chars">
                <span className="line"><Split text="מה מקבלים" /></span>
                <span className="line"><Split text="בפועל?" /></span>
              </h2>
              <p className="x-cue" aria-hidden="true"><span>גללו</span><i /></p>
            </header>
            <ul className="diff__list">
              {items.map((it, i) => (
                <li key={it.title} className="diff__item glass" data-spot>
                  <span className="diff__num num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <DiffVisual kind={it.kind} />
                  <h3 className="t-h3">{it.title}</h3>
                  <p className="t-body">{it.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="row-meter" aria-hidden="true">
            <span className="num" data-row-count>01</span>
            <i><b data-row-bar /></i>
            <span className="num">{total}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
