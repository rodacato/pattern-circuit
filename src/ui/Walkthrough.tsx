import { useState } from 'react'
import { msg, N } from '../i18n'
import type { AppKey } from '../i18n/keys'
import { useT } from './i18nContext'
import { useDialog } from './useDialog'

const STEPS: { title: AppKey; body: AppKey }[] = [
  { title: N('ui.walkthrough.circuit.title'), body: N('ui.walkthrough.circuit.body') },
  { title: N('ui.walkthrough.time.title'), body: N('ui.walkthrough.time.body') },
  { title: N('ui.walkthrough.code.title'), body: N('ui.walkthrough.code.body') },
  { title: N('ui.walkthrough.patterns.title'), body: N('ui.walkthrough.patterns.body') },
]

export function Walkthrough({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [step, setStep] = useState(0)
  const next = useDialog<HTMLButtonElement>(onClose)
  const last = step === STEPS.length - 1
  const { title, body } = STEPS[step]

  return (
    <div className="notebook-backdrop" onClick={onClose}>
      <section className="walkthrough card" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title" data-testid="walkthrough" onClick={(e) => e.stopPropagation()}>
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
