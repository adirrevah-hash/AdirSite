// The floating accessibility button and its panel. The markup is static; the
// choices are applied by lib/motion/a11y.ts and remembered for the next visit
// (and applied before first paint by the script in the layout).
const OPTIONS = [
  { id: 'text', label: 'הגדלת טקסט', icon: <><path d="M4 18L9 6l5 12M5.8 14h6.4" /><path d="M16 18l2.5-6 2.5 6M16.8 16.3h3.4" /></> },
  { id: 'contrast', label: 'ניגודיות גבוהה', icon: <><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></> },
  { id: 'links', label: 'הדגשת קישורים', icon: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></> },
  { id: 'font', label: 'גופן קריא', icon: <><path d="M6 19V5h7a4 4 0 0 1 0 8H6" /><path d="M11 13l6 6" /></> },
  { id: 'still', label: 'עצירת אנימציות', icon: <><circle cx="12" cy="12" r="8" /><path d="M10 9v6M14 9v6" /></> },
] as const

export default function A11yFloat() {
  return (
    <div className="a11y" data-a11y>
      <button type="button" className="a11y__fab glass" aria-label="תפריט נגישות" aria-expanded="false" aria-controls="a11y-panel" data-a11y-toggle>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.6" r="1.9" fill="currentColor" stroke="none" /><path d="M5 8.6l7 1.6 7-1.6M12 10.2v4.3l-3.2 6M12 14.5l3.2 6" /></svg>
      </button>
      <div id="a11y-panel" className="a11y__panel glass on-dark" role="dialog" aria-label="התאמות נגישות" hidden data-a11y-panel>
        <div className="a11y__head">
          <p className="a11y__title">התאמות נגישות</p>
          <button type="button" className="a11y__close" aria-label="סגירה" data-a11y-close>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="a11y__grid">
          {OPTIONS.map(o => (
            <button key={o.id} type="button" className="a11y__opt" aria-pressed="false" data-a11y-opt={o.id}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{o.icon}</svg>
              <span>{o.label}</span>
              {o.id === 'text' && <span className="a11y__steps" aria-hidden="true"><i /><i /></span>}
            </button>
          ))}
        </div>
        <div className="a11y__foot">
          <button type="button" className="a11y__reset" data-a11y-reset>איפוס הגדרות</button>
          <button type="button" className="inline-link" data-dialog="dlg-accessibility" aria-haspopup="dialog">הצהרת נגישות</button>
        </div>
      </div>
    </div>
  )
}
