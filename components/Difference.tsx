import Split from './Split'

const items = [
  { icon: 'build', title: 'אתר שנבנה לעסק שלכם', text: 'מבנה, תוכן ועיצוב שנקבעים לפי העסק והקהל שלו, לא לפי תבנית מוכנה.' },
  { icon: 'phone', title: 'מותאם לטלפון מהיום הראשון', text: 'כל מסך מתוכנן גם לנייד, וכל כפתור נוח ללחיצה באגודל.' },
  { icon: 'lead', title: 'פניות שמגיעות אליכם', text: 'טופס ווואטסאפ מחוברים ונבדקים לפני ההשקה, כדי שאף פנייה לא תלך לאיבוד.' },
  { icon: 'brand', title: 'שפה חזותית אחת', text: 'אותו מותג מהלוגו, דרך כרטיס הביקור ועד האתר.' },
] as const

function Icon({ kind }: { kind: (typeof items)[number]['icon'] }) {
  return (
    <svg className="diff__icon" viewBox="0 0 48 48" aria-hidden="true">
      {kind === 'build' && <><rect x="8" y="10" width="32" height="24" rx="2" /><path d="M8 16h32M14 40h20M24 34v6" /></>}
      {kind === 'phone' && <><rect x="15" y="6" width="18" height="36" rx="4" /><path d="M21 36h6" /></>}
      {kind === 'lead' && <><path d="M8 12h32v20H20l-8 6v-6H8z" /><path d="M16 20h16M16 26h10" /></>}
      {kind === 'brand' && <><circle cx="18" cy="24" r="10" /><rect x="24" y="14" width="18" height="20" rx="2" /></>}
    </svg>
  )
}

export default function Difference() {
  return (
    <section id="difference" className="diff on-light bg-off-white" aria-labelledby="diff-title">
      <div className="wrap">
        <div className="diff__layout">
          <header className="diff__head">
            <p className="t-label">ההבדל</p>
            <h2 id="diff-title" className="t-h2" data-reveal="chars">
              <span className="line"><Split text="מה מקבלים" /></span>
              <span className="line"><Split text="בפועל." /></span>
            </h2>
          </header>
          <ul className="diff__list" data-reveal="fade">
            {items.map(it => (
              <li key={it.title} className="diff__item">
                <Icon kind={it.icon} />
                <h3 className="t-h3">{it.title}</h3>
                <p className="t-body">{it.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
