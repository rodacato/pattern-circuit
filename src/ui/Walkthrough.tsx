import { useLayoutEffect, useRef, useState } from 'react'
import { msg, N } from '../i18n'
import type { AppKey } from '../i18n/keys'
import { useT } from './i18nContext'
import { placeCard, type Box } from './spotlight'
import { useDialog } from './useDialog'

// The first region on screen is the one lit: the inventory only appears once a level has a socket.
const STEPS: { title: AppKey; body: AppKey; targets: string[] }[] = [
  { title: N('ui.walkthrough.circuit.title'), body: N('ui.walkthrough.circuit.body'), targets: ['.stage'] },
  { title: N('ui.walkthrough.time.title'), body: N('ui.walkthrough.time.body'), targets: ['.transport'] },
  { title: N('ui.walkthrough.code.title'), body: N('ui.walkthrough.code.body'), targets: ['.code-panel'] },
  { title: N('ui.walkthrough.patterns.title'), body: N('ui.walkthrough.patterns.body'), targets: ['.inventory', '.topbar'] },
]

type Layout = { target: Box; card: { left: number; top: number } }

export function Walkthrough({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [step, setStep] = useState(0)
  const next = useDialog<HTMLButtonElement>(onClose)
  const card = useRef<HTMLElement>(null)
  const [layout, setLayout] = useState<Layout>()
  const last = step === STEPS.length - 1
  const { title, body, targets } = STEPS[step]

  useLayoutEffect(() => {
    const measure = () => {
      const region = targets.map((s) => document.querySelector(s)).find(Boolean)?.getBoundingClientRect()
      if (!region || !card.current) return setLayout(undefined)
      const box = { left: region.left, top: region.top, width: region.width, height: region.height }
      const size = { width: card.current.offsetWidth, height: card.current.offsetHeight }
      setLayout({ target: box, card: placeCard(box, size, { width: innerWidth, height: innerHeight }) })
    }
    measure()
    addEventListener('resize', measure)
    return () => removeEventListener('resize', measure)
  }, [targets])

  return (
    <div className={`notebook-backdrop walkthrough-backdrop${layout ? ' lit' : ''}`} onClick={onClose}>
      {layout && <div className="spotlight" style={layout.target} />}
      <section
        ref={card}
        className="walkthrough card"
        style={layout && { ...layout.card, transform: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkthrough-title"
        data-testid="walkthrough"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="eyebrow">{t(msg('ui.walkthrough.step', { n: step + 1, total: STEPS.length }))}</span>
        <h2 id="walkthrough-title">{t(title)}</h2>
        <p>{t(body)}</p>
        <div className="actions">
          <button className="link" onClick={onClose}>
            {t('ui.walkthrough.skip')}
          </button>
          {step > 0 && <button onClick={() => setStep(step - 1)}>{t('ui.walkthrough.back')}</button>}
          <button ref={next} className="primary" data-testid="walkthrough-next" onClick={() => (last ? onClose() : setStep(step + 1))}>
            {t(last ? 'ui.walkthrough.done' : 'ui.walkthrough.next')}
          </button>
        </div>
      </section>
    </div>
  )
}
