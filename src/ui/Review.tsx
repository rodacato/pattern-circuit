import { useState } from 'react'
import { FAMILY_NAMES, PATTERNS, type Level, type PatternId } from '../engine'
import { dueItems, reviewItems, ROUND_SIZE, type ReviewItem } from '../game/learning/review'
import type { GameSession } from '../game/session/GameSession'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useDialog } from './useDialog'

// The cartridge order changes on every question: the pattern is remembered, not its position.
const shuffled = <T,>(items: T[]) => [...items].map((x) => ({ x, k: Math.random() })).sort((a, b) => a.k - b.k).map(({ x }) => x)

type Question = { item: ReviewItem; choices: PatternId[] }

// Review: problems from already completed levels, without a circuit. Pick the pattern and read why.
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
            <span className="eyebrow">{t('ui.review.eyebrow')}</span>
            <h2 id="review-title">{done ? t('ui.review.done') : t(msg('ui.review.question', { i: index + 1, n: round.length }))}</h2>
          </div>
          <button ref={closeButton} className="close" onClick={onClose} aria-label={t('ui.review.close')}>
            ×
          </button>
        </header>
        {round.length === 0 && <p className="muted">{t('ui.review.empty')}</p>}
        {done && round.length > 0 && (
          <p>{t(msg('ui.review.summary', { right, n: round.length }))}</p>
        )}
        {q && <QuestionView question={q} picked={picked} onPick={pick} />}
        <div className="actions">
          {q && picked && (
            <button className="primary" onClick={next}>
              {t(index + 1 < round.length ? 'ui.review.next' : 'ui.review.result')}
            </button>
          )}
          {(done || round.length === 0) && <button onClick={onClose}>{t('ui.review.back')}</button>}
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
        {t(msg('ui.common.levelTitle', { n: item.level.order, title: item.level.title }))}
        {item.multiSocket && ` · ${t(msg('ui.review.socket', { label: item.socket.label }))}`}
      </span>
      <p className="problem">{t(item.level.brief.problem)}</p>
      <p className="muted">{t('ui.review.prompt')}</p>
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
          <span className="where">{picked === item.answer ? `✓ ${t('ui.review.correct')}` : `✗ ${t(msg('ui.review.answer', { pattern: PATTERNS[item.answer].name }))}`}</span>
          <strong>{t(option.note.title)}</strong>
          <p>{t(option.note.body)}</p>
        </article>
      )}
    </section>
  )
}
