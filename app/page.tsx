import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Philosophy from '@/components/Philosophy'
import Work from '@/components/Work'
import Services from '@/components/Services'
import Process from '@/components/Process'
import Difference from '@/components/Difference'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Philosophy />
        <Work />
        <Services />
        <Process />
        <Difference />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
