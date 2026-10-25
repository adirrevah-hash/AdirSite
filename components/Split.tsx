// Text split into words and letters for the motion layer, rendered on the
// server so nothing reflows when the animation starts. Screen readers get the
// sentence once, from the hidden copy; the split letters are presentation.
// Words with Latin letters or digits stay whole: as separate inline blocks
// they would be reordered right-to-left by the bidi algorithm.
import { Fragment } from 'react'

const LATIN =/[A-Za-z0-9@]/

export default function Split({ text, by = 'chars', start = 0 }: { text: string; by?: 'chars' | 'words'; start?: number }) {
  const words = text.split(' ')
  let n = start // running index, so CSS can stagger with --ci
  const unit = (content: string, key: number, ltr?: boolean) => (
    <span key={key} className="c" dir={ltr ? 'ltr' : undefined} style={{ ['--ci' as string]: n++ }}>{content}</span>
  )
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="split" aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="w">
              {by === 'words' || LATIN.test(w)
                ? unit(w, 0, LATIN.test(w))
                : [...w].map((ch, j) => unit(ch, j))}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </>
  )
}
