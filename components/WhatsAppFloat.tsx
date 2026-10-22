'use client'

import { useEffect, useState } from 'react'
import { whatsappUrl } from '@/lib/site'
import { IconWhatsApp } from './icons'

// Appears once the hero is behind the visitor, steps aside while the contact
// section (which has its own WhatsApp link) is on screen.
export default function WhatsAppFloat() {
  const [pastHero, setPastHero] = useState(false)
  const [atContact, setAtContact] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(scrollY > innerHeight * 0.9)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    const contact = document.getElementById('contact')
    const io = contact ? new IntersectionObserver(([e]) => setAtContact(e.isIntersecting), { threshold: 0.15 }) : null
    if (contact) io!.observe(contact)
    return () => { removeEventListener('scroll', onScroll); io?.disconnect() }
  }, [])

  const on = pastHero && !atContact
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-float${on ? ' is-on' : ''}`}
      aria-label="שיחה בוואטסאפ"
      tabIndex={on ? 0 : -1}
      aria-hidden={!on}
    >
      <IconWhatsApp />
    </a>
  )
}
