import Blueprint from './Blueprint'
import Obj3D from './Obj3D'
import Split from './Split'

// The pause after the hero: light ground, one statement, three principles.
// With motion the statement fills in word by word as it moves up the screen,
// framed by a measured selection box as in a design tool. Beside it the three
// principles, as 3D forms (sphere, cube, plus), come together into one
// sculpture as the reader scrolls.
const principles = [
  { form: 'sphere', title: 'ברור לפני יפה', text: 'כל עמוד מתחיל בשאלה מה הגולש צריך להבין ומה הוא צריך לעשות. העיצוב בא לשרת את התשובה.' },
  { form: 'cube', title: 'הדיוק בפרטים', text: 'ריווח, טיפוגרפיה ותנועה הם מה שמבדיל אתר מקצועי מתבנית. כל אחד מהם נבחר במכוון.' },
  { form: 'plus', title: 'נמדד בתוצאה', text: 'אתר נבחן במה שהוא עושה: כמה ברור הוא, כמה מהר הוא נטען, וכמה פניות הוא מביא.' },
] as const

export default function Philosophy() {
  return (
    <section id="approach" className="philo on-light bg-off-white" aria-labelledby="approach-title" data-philo>
      <Blueprint />
      <div className="wrap">
        <div className="philo__top">
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
          <div className="philo__scene" aria-hidden="true" data-forms>
            <div className="philo__fallback">
              <Obj3D kind="sphere" /><Obj3D kind="cube" /><Obj3D kind="plus" />
            </div>
            <canvas className="philo__canvas" data-forms-canvas />
          </div>
        </div>
        <div className="philo__grid" data-reveal="fade">
          {principles.map(p => (
            <div key={p.title} className="principle">
              <Obj3D kind={p.form} className="principle__form" />
              <h3 className="t-h3">{p.title}</h3>
              <p className="t-body">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
