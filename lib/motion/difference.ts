import { gsap } from 'gsap'
import { cardRow } from './sideways'

// What the client gets, as a row of cards that travels sideways while the
// section holds, with the same meter and drifting phrase as the services.
export function initDifference(reduced: boolean) {
  const room = document.querySelector<HTMLElement>('#difference .x-room')
  const items = [...document.querySelectorAll<HTMLElement>('#difference .diff__item')]
  if (reduced || !room || !items.length) return () => {}
  const mm = gsap.matchMedia()
  mm.add('(min-width: 0px)', () => cardRow(room, items, '.diff__item, .diff__head'))
  return () => mm.revert()
}
