import type { Metadata } from 'next'
import Header from '@/components/Header'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import A11yFloat from '@/components/A11yFloat'
import CookieBar from '@/components/CookieBar'
import { site, whatsappUrl } from '@/lib/site'
import { packages, carePlans, addOns } from '@/lib/pricing'

const title = `מסלולים ומחירים | ${site.name}`
const description = 'חבילות להקמת אתר: דף נחיתה, אתר תדמית וחוויית מותג דיגיטלית, שירותים נוספים ומסלולי תחזוקה חודשיים. המחירים וכל מה שכלול בכל מסלול.'

export const metadata: Metadata = {
  title,
  description,
  ...(site.url ? { alternates: { canonical: '/pricing' } } : {}),
  openGraph: {
    type: 'website', locale: 'he_IL', siteName: site.name, title, description, url: '/pricing',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'ARStudio: נוכחות דיגיטלית שמביאה תוצאות' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
}

// The studio's prices as structured data, so search engines read them as offers.
const offers = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: `${site.name}: מסלולים ומחירים`,
  itemListElement: [
    ...packages.map(p => ({ '@type': 'Offer', name: `${p.code} – ${p.name}`, description: p.description, price: p.price, priceCurrency: 'ILS' })),
    ...addOns.map(a => ({ '@type': 'Offer', name: a.name, priceSpecification: { '@type': 'PriceSpecification', minPrice: a.from, priceCurrency: 'ILS' } })),
    ...carePlans.map(p => ({
      '@type': 'Offer', name: `${p.code} – ${p.name}`,
      priceSpecification: { '@type': 'UnitPriceSpecification', price: p.price, priceCurrency: 'ILS', unitText: 'MONTH' },
    })),
  ],
}

// The plans on a page of their own, reached from the menu and from the
// plans band on the home page. The header's section links lead back home.
export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offers).replace(/</g, '\\u003c') }} />
      <Header current="/pricing" />
      <main id="main" className="pricing-page">
        <Pricing />
        <section className="pricing-help on-dark" aria-labelledby="pricing-help-title">
          <div className="wrap pricing-help__inner">
            <div>
              <h2 id="pricing-help-title" className="pricing-help__title">לא בטוחים איזה מסלול מתאים לכם?</h2>
              <p className="pricing-help__text">ספרו לנו על העסק, ונעזור לבחור את המסלול הנכון. שיחה קצרה, בלי התחייבות.</p>
            </div>
            <div className="pricing-help__actions">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn btn--light">בואו נדבר בוואטסאפ <span className="btn__arrow" aria-hidden="true">←</span></a>
              <a href="/#work" className="link">לעבודות שלנו</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
      <A11yFloat />
      <CookieBar />
    </>
  )
}
