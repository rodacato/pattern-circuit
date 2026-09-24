import { useState } from 'react'
import { FAMILY_NAMES, PATTERNS, type Level, type PatternId } from '../engine'
import { dueItems, reviewItems, ROUND_SIZE, type ReviewItem } from '../game/learning/review'
import type { GameSession } from '../game/session/GameSession'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useDialog } from './useDialog'

// El orden de los cartuchos cambia en cada pregunta: se recuerda el patrón, no su posición.
const shuffled = <T,>(items: T[]) => [...items].map((x) => ({ x, k: Math.random() })).sort((a, b) => a.k - b.k).map(({ x }) => x)

type Question = { item: ReviewItem; choices: PatternId[] }

// Repaso: problemas de niveles ya completados, sin circuito. Elegir el patrón y leer por qué.
export function Review({ session, levels, onClose }: { session: GameSession; levels: Level[]; onClose: () => void }) {
  const [round] = useState<Question[]>(() => {
    const { completed, review } = session.progress
    return dueItems(reviewItems(levels, completed), review, Date.now())
      .slice(0, ROUND_SIZE)
      .map((item) => ({ item, choices: shuffled(item.socket.inventory) }))
  })
  const t = useT()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<PatternId>()
  const [right, setRight] = useState(0)
  const closeButton = useDialog<HTMLButtonElement>(onClose)
  const q = round[index]
  const done = index >= round.length

  const pick = (pattern: PatternId) => {
    if (picked) return
    const correct = pattern === q.item.answer
    setPicked(pattern)
    if (correct) setRight(right + 1)
    session.recordReview(q.item.id, correct)
  }
  const next = () => {
    setPicked(undefined)
    setIndex(index + 1)
  }

  return (
    <div className="notebook-backdrop" onClick={onClose}>
      <aside className="notebook review card" role="dialog" aria-modal="true" aria-labelledby="review-title" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">{t('Repaso')}</span>
            <h2 id="review-title">{done ? t('Ronda terminada') : t(msg('Pregunta {i} de {n}', { i: index + 1, n: round.length }))}</h2>
          </div>
          <button ref={closeButton} className="close" onClick={onClose} aria-label={t('Cerrar repaso')}>
            ×
          </button>
        </header>
        {round.length === 0 && <p className="muted">{t('Nada pendiente. Los problemas de los niveles que completes vuelven aquí para repasarlos cada vez más espaciados.')}</p>}
        {done && round.length > 0 && (
          <p>{t(msg('Acertaste {right} de {n}. Los que fallaste vuelven en la próxima ronda; los que acertaste, dentro de unos días.', { right, n: round.length }))}</p>
        )}
        {q && <QuestionView question={q} picked={picked} onPick={pick} />}
        <div className="actions">
          {q && picked && (
            <button className="primary" onClick={next}>
              {t(index + 1 < round.length ? 'Siguiente →' : 'Ver resultado')}
            </button>
          )}
          {(done || round.length === 0) && <button onClick={onClose}>{t('Volver al juego')}</button>}
        </div>
      </aside>
    </div>
  )
}

function QuestionView({ question: { item, choices }, picked, onPick }: { question: Question; picked?: PatternId; onPick: (p: PatternId) => void }) {
  const t = useT()
  const option = picked && item.socket.options[picked]
  return (
    <section className="review-question" aria-live="polite">
      <span className="where">
        {t(msg('Nivel {n} · {title}', { n: item.level.order, title: item.level.title }))}
        {item.multiSocket && ` · socket "${t(item.socket.label)}"`}
      </span>
      <p className="problem">{t(item.level.brief.problem)}</p>
      <p className="muted">{t('¿Qué patrón enchufarías?')}</p>
      <div className="choices">
        {choices.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            disabled={!!picked}
            className={picked && p === item.answer ? 'right' : picked === p ? 'wrong' : ''}
            aria-label={`${t(PATTERNS[p].name)}, ${t(FAMILY_NAMES[PATTERNS[p].family])}`}
          >
            {t(PATTERNS[p].name)} <small>{t(FAMILY_NAMES[PATTERNS[p].family])}</small>
          </button>
        ))}
      </div>
      {option && (
        <article className={`note ${option.outcome}`}>
          <span className="where">{picked === item.answer ? `✓ ${t('Correcto')}` : `✗ ${t(msg('La respuesta era {pattern}', { pattern: PATTERNS[item.answer].name }))}`}</span>
          <strong>{t(option.note.title)}</strong>
          <p>{t(option.note.body)}</p>
        </article>
      )}
    </section>
  )
}
