import { services } from '@/lib/site'

// Two rows of the studio's disciplines running in opposite directions. They
// drift on their own and speed up with the reader's scroll. Decorative: the
// same services are listed properly further down.
function Row({ outline }: { outline?: boolean }) {
  const items = services.map(s => s.title)
  const run = (copy: number) => (
    <span className="marquee__run" key={copy}>
      {items.map(t => (
        <span key={t} className="marquee__item">
          {t}
          <i className="marquee__mark"><b /><b /><b /><b /></i>
        </span>
      ))}
    </span>
  )
  return <div className={`marquee__row${outline ? ' marquee__row--outline' : ''}`} data-marquee={outline ? -1 : 1}>{run(0)}{run(1)}</div>
}

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <Row />
      <Row outline />
    </div>
  )
}
