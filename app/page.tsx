import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Philosophy from '@/components/Philosophy'
import Work from '@/components/Work'
import About from '@/components/About'
import Services from '@/components/Services'
import Process from '@/components/Process'
import Difference from '@/components/Difference'
import Statement from '@/components/Statement'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import A11yFloat from '@/components/A11yFloat'
import CookieBar from '@/components/CookieBar'

export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Philosophy />
        <Work />
        <About />
        <Services />
        <Process />
        <Difference />
        <Statement />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFloat />
      <A11yFloat />
      <CookieBar />
    </>
  )
}
