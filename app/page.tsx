import SiteHeader from '@/components/SiteHeader'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Work from '@/components/Work'
import Process from '@/components/Process'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Services />
        <Work />
        <Process />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
