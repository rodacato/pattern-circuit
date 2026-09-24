import { useState } from 'react'
import { FAMILY_NAMES, PATTERNS, type Level, type PatternId } from '../engine'
import { dueItems, reviewItems, ROUND_SIZE, type ReviewItem } from '../game/learning/review'
import type { GameSession } from '../game/session/GameSession'
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
            <span className="eyebrow">Repaso</span>
            <h2 id="review-title">{done ? 'Ronda terminada' : `Pregunta ${index + 1} de ${round.length}`}</h2>
          </div>
          <button ref={closeButton} className="close" onClick={onClose} aria-label="Cerrar repaso">
            ×
          </button>
        </header>
        {round.length === 0 && <p className="muted">Nada pendiente. Los problemas de los niveles que completes vuelven aquí para repasarlos cada vez más espaciados.</p>}
        {done && round.length > 0 && (
          <p>
            Acertaste <b>{right}</b> de {round.length}. Los que fallaste vuelven en la próxima ronda; los que acertaste, dentro de unos días.
          </p>
        )}
        {q && <QuestionView question={q} picked={picked} onPick={pick} />}
        <div className="actions">
          {q && picked && (
            <button className="primary" onClick={next}>
              {index + 1 < round.length ? 'Siguiente →' : 'Ver resultado'}
            </button>
          )}
          {(done || round.length === 0) && <button onClick={onClose}>Volver al juego</button>}
        </div>
      </aside>
    </div>
  )
}

function QuestionView({ question: { item, choices }, picked, onPick }: { question: Question; picked?: PatternId; onPick: (p: PatternId) => void }) {
  const option = picked && item.socket.options[picked]
  return (
    <section className="review-question" aria-live="polite">
      <span className="where">
        Nivel {item.level.order} · {item.level.title}
        {item.multiSocket && ` · socket "${item.socket.label}"`}
      </span>
      <p className="problem">{item.level.brief.problem}</p>
      <p className="muted">¿Qué patrón enchufarías?</p>
      <div className="choices">
        {choices.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            disabled={!!picked}
            className={picked && p === item.answer ? 'right' : picked === p ? 'wrong' : ''}
            aria-label={`${PATTERNS[p].name}, ${FAMILY_NAMES[PATTERNS[p].family]}`}
          >
            {PATTERNS[p].name} <small>{FAMILY_NAMES[PATTERNS[p].family]}</small>
          </button>
        ))}
      </div>
      {option && (
        <article className={`note ${option.outcome}`}>
          <span className="where">{picked === item.answer ? '✓ Correcto' : `✗ La respuesta era ${PATTERNS[item.answer].name}`}</span>
          <strong>{option.note.title}</strong>
          <p>{option.note.body}</p>
        </article>
      )}
    </section>
  )
}
