import { whatsappUrl } from '@/lib/site'
import { IconWhatsApp } from './icons'

// Hidden on the hero and near the contact section and footer; lib/motion
// switches it on in between.
export default function WhatsAppFloat() {
  return (
    <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="שיחה בוואטסאפ" data-wa-float>
      <IconWhatsApp />
    </a>
  )
}
