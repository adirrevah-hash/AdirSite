import { CTA_LABEL, whatsappUrl } from '@/lib/site'
import HeroMotion from './HeroMotion'

// The first screen: the claim and the next step are readable immediately.
// Scrolling then pushes into the bowl of the "d" in the wordmark and blue
// floods out of it into the services chapter.
export default function Hero() {
  return (
    <section id="top" className="hero" data-tone="paper" data-sc-act="pin" data-sc-span="1.5" style={{ height: '150vh' }}>
      <div data-sc-stage data-sc-verify-state="">
        <span className="hero__ghost mark" aria-hidden="true">ARStudio</span>

        <div className="hero__copy" data-sc-cue="0 0.26 0">
          <h1 className="hero__title display display-xl">
            אתרים שנבנים
            <br />
            בכוונה.
          </h1>
          <p className="hero__lede lede">
            ARStudio הוא סטודיו לבניית אתרים, דפי נחיתה, עיצוב לוגו וכרטיסי ביקור. לעסקים, בעלי מקצוע ויזמים.
          </p>
          <div className="hero__actions">
            <a href="#contact" className="btn btn--solid">{CTA_LABEL}</a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="textlink">
              או ישר לוואטסאפ <span className="arrow" aria-hidden="true">←</span>
            </a>
          </div>
        </div>

        <span className="hero__mark mark" aria-hidden="true">
          ARStu<span className="hero__d">d</span><span className="hero__bl" />io
        </span>
        <div className="hero__iris" aria-hidden="true" />

        {/* The services chapter opens inside the blue, so the colour arrives with
            something to say instead of as an empty screen. */}
        <div className="hero__next" data-tone="blue" data-sc-cue="0.5 1 0.18 0" data-sc-rise="0">
          <div className="services__head">
            <h2 id="services-title" className="display display-lg m-0">מה בונים בסטודיו.</h2>
            <p className="lede m-0">ארבעה שירותים, שפה אחת. מהלוגו ועד האתר, כל חלק נבנה כדי לעבוד יחד עם השאר.</p>
          </div>
        </div>
      </div>
      <HeroMotion />
    </section>
  )
}
