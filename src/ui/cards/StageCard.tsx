import { useState } from 'react'
import { PATTERNS, type Evaluation, type MetricName } from '../../engine'
import { choiceLabel, isRight, type Prediction } from '../../game/learning/prediction'
import type { GameSession } from '../../game/session/GameSession'
import { msg, N, type Translate } from '../../i18n'
import type { AppKey } from '../../i18n/keys'
import { useT } from '../i18nContext'
import { SeenIn } from '../SeenIn'
import { useSession } from '../useSession'

const METRIC_TEXT: Record<MetricName, AppKey> = {
  spawned: N('cards.metrics.spawned'),
  delivered: N('cards.metrics.delivered'),
  dropped: N('cards.metrics.dropped'),
  invalidAtSink: N('cards.metrics.invalidAtSink'),
  duplicatesAtSink: N('cards.metrics.duplicatesAtSink'),
  cancelled: N('cards.metrics.cancelled'),
  maxLoad: N('cards.metrics.maxLoad'),
  nodesTouched: N('cards.metrics.nodesTouched'),
  nodes: N('cards.metrics.nodes'),
}

const OP_TEXT = {
  '==': N('cards.expectation.equal'),
  '<=': N('cards.expectation.atMost'),
  '>=': N('cards.expectation.atLeast'),
} as const

const OUTCOME = {
  solves: { label: N('cards.outcome.solves'), tone: 'good' },
  partial: { label: N('cards.outcome.partial'), tone: 'warn' },
  misfit: { label: N('cards.outcome.misfit'), tone: 'bad' },
} as const

const names = (session: GameSession, t: Translate) => session.pluggedPatterns.map((p) => t(PATTERNS[p].name)).join(' + ')

// The card that accompanies each stage of the level flow.
export function StageCard({ session, onNext }: { session: GameSession; onNext?: () => void }) {
  const stage = useSession(session, (s) => s.flow.stage)
  const result = useSession(session, (s) => s.result)
  const plugged = useSession(session, (s) => s.flow.last)
  const asking = useSession(session, (s) => s.awaitingPrediction)
  const [dismissed, setDismissed] = useState<Evaluation>()

  if (stage === 'complete') return <WinCard session={session} onNext={onNext} />
  if (stage === 'change') return <TicketCard session={session} />
  if (stage === 'compare') return <CompareCard session={session} />
  if (stage === 'choose' && asking) return <PredictionCard session={session} />
  if (!result || dismissed === result) return null
  const close = () => setDismissed(result)
  if (stage === 'choose' && plugged) return <NoteCard session={session} onClose={close} />
  if (stage === 'choose') return <ProblemCard session={session} result={result} onClose={close} />
  return <FailCard session={session} result={result} onClose={close} />
}

function Failures({ result }: { result: Evaluation }) {
  const t = useT()
  return (
    <ul className="failures">
      {result.results
        .filter((r) => !r.pass)
        .map((r) => (
          <li key={r.assertion.metric}>
            <b>{r.actual}</b> {t(r.assertion.label ?? METRIC_TEXT[r.assertion.metric])}{' '}
            <span className="expected">
              ({t(OP_TEXT[r.assertion.op])} {r.assertion.value})
            </span>
          </li>
        ))}
    </ul>
  )
}

function Close({ onClose }: { onClose?: () => void }) {
  const t = useT()
  return onClose ? (
    <button className="close" onClick={onClose} aria-label={t('cards.close')}>
      ×
    </button>
  ) : null
}

// Without a mouse a wire cannot be dragged: the "Conectar" button makes the same repair.
function FailCard({ session, result, onClose }: { session: GameSession; result: Evaluation; onClose?: () => void }) {
  const t = useT()
  const repair = session.pendingRepairs[0]
  const wire = repair?.patch.add?.wires?.[0]
  const nodeLabel = (id: string) => session.playback.circuit.nodes.get(id)?.label ?? id
  return (
    <div className="stage-card card bad" role="status">
      <Close onClose={onClose} />
      <span className="eyebrow">{t('cards.stage.fail.title')}</span>
      <Failures result={result} />
      {repair && <p className="hint">💡 {t(repair.prompt)}</p>}
      <div className="actions">
        <button onClick={() => session.play()}>{t('cards.stage.fail.retry')}</button>
        {wire && (
          <button className="link" onClick={() => session.connect(wire.from, wire.to)}>
            {t(msg('cards.stage.fail.connect', { from: nodeLabel(wire.from), to: nodeLabel(wire.to) }))}
          </button>
        )}
      </div>
    </div>
  )
}

// Hints from least to most; the last one says which pattern to try.
function Hints({ session }: { session: GameSession }) {
  const t = useT()
  const shown = useSession(session, (s) => s.hintsShown)
  const ladder = session.hintLadder
  const hints = ladder.slice(0, shown).map(t)
  return (
    <>
      {hints.length > 0 && (
        <ol className="hints">
          {hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
      {shown < ladder.length && (
        <button className="link hint-button" onClick={() => session.nextHint()}>
          💡 {t(shown === 0 ? 'cards.stage.hints.first' : 'cards.stage.hints.another')} ({shown + 1}/{ladder.length})
        </button>
      )}
    </>
  )
}

function ProblemCard({ session, result, onClose }: { session: GameSession; result: Evaluation; onClose?: () => void }) {
  const t = useT()
  return (
    <div className="stage-card card bad" role="status">
      <Close onClose={onClose} />
      <span className="eyebrow">{t('cards.stage.problem.title')}</span>
      <Failures result={result} />
      <p className="hint">{t('cards.stage.problem.instruction')}</p>
      <Hints session={session} />
    </div>
  )
}

// Before running: the player commits to an answer.
function PredictionCard({ session }: { session: GameSession }) {
  const t = useT()
  const p = session.prediction!
  return (
    <div className="stage-card card predict" role="status">
      <span className="eyebrow">🔮 {t('cards.stage.predict.title')}</span>
      <h3>{t(p.question)}</h3>
      <Choices prediction={p} onPick={(id) => session.predict(id)} />
      <div className="actions">
        <button className="link" onClick={() => session.skipPrediction()}>
          {t('cards.stage.predict.skip')}
        </button>
      </div>
    </div>
  )
}

function Choices({ prediction, onPick }: { prediction: Prediction; onPick: (id: string) => void }) {
  const t = useT()
  return (
    <div className="choices">
      {prediction.choices.map((c) => (
        <button key={c.id} onClick={() => onPick(c.id)}>
          {t(c.label)}
        </button>
      ))}
    </div>
  )
}

// After the run: the prediction compared with what happened.
function PredictionResult({ prediction }: { prediction?: Prediction }) {
  const t = useT()
  if (!prediction?.guess) return null
  const right = isRight(prediction)
  return (
    <p className={`prediction-result ${right ? 'good' : 'bad'}`}>
      {right
        ? `🎯 ${t('cards.stage.predict.right')}`
        : `🔮 ${t(msg('cards.stage.predict.wrong', { guess: choiceLabel(prediction, prediction.guess) ?? '', answer: choiceLabel(prediction, prediction.answer) ?? '' }))}`}
    </p>
  )
}

function NoteCard({ session, onClose }: { session: GameSession; onClose?: () => void }) {
  const t = useT()
  const option = session.pluggedOption!
  const solved = session.flow.solved
  const outcome = OUTCOME[option.outcome]
  const pending = session.pendingSockets
  return (
    <div className={`stage-card card ${outcome.tone}`} role="status">
      <Close onClose={solved ? undefined : onClose} />
      <span className={`badge ${outcome.tone}`}>{t(outcome.label)}</span>
      <PredictionResult prediction={session.prediction?.kind === 'outcome' ? session.prediction : undefined} />
      <h3>{t(option.note.title)}</h3>
      <p>{t(option.note.body)}</p>
      {!solved && session.result && <Failures result={session.result} />}
      <div className="actions">
        {solved ? (
          <button className="primary" onClick={() => session.continue()}>
            {t(session.ticket ? 'cards.stage.note.nextTicket' : 'cards.stage.note.nextCompare')}
          </button>
        ) : option.outcome === 'solves' && pending.length ? (
          <span className="muted">{t(msg('cards.stage.note.pending', { pending: pending.map((s) => t(s.label)).join(', ') }))}</span>
        ) : (
          <span className="muted">{t('cards.stage.note.tryAnother')}</span>
        )}
      </div>
      {!solved && <Hints session={session} />}
    </div>
  )
}

function TicketCard({ session }: { session: GameSession }) {
  const t = useT()
  const applied = useSession(session, (s) => s.flow.ticket !== 'open')
  const done = useSession(session, (s) => s.flow.ticket === 'met')
  const touched = useSession(session, (s) => s.touched.length)
  const running = useSession(session, (s) => s.playback.playing)
  const prediction = session.prediction?.kind === 'touched' ? session.prediction : undefined
  return (
    <div className="stage-card card ticket" role="status">
      <span className="eyebrow">📋 {t('cards.stage.ticket.title')}</span>
      <h3>{session.ticket && t(session.ticket.text)}</h3>
      {!applied && prediction && (
        <>
          <p>{t(prediction.question)}</p>
          <Choices prediction={prediction} onPick={(id) => session.predict(id)} />
          <div className="actions">
            <button className="link" onClick={() => session.skipPrediction()}>
              {t('cards.stage.ticket.skipPrediction')}
            </button>
          </div>
        </>
      )}
      {!applied && !prediction && (
        <div className="actions">
          <button className="primary" onClick={() => session.applyTicket()}>
            {t('cards.stage.ticket.apply')}
          </button>
        </div>
      )}
      {applied && (
        <>
          <div className="big-stat">
            <b className={touched ? 'bad' : 'good'}>{touched}</b>
            <span>{t('cards.metrics.nodesTouched')}</span>
          </div>
          <PredictionResult prediction={prediction} />
          <p className="muted">{t(touched ? 'cards.stage.ticket.opened' : 'cards.stage.ticket.added')}</p>
          <div className="actions">
            <button className="primary" disabled={!done || running} onClick={() => session.continue()}>
              {t('cards.stage.ticket.compare')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CompareCard({ session }: { session: GameSession }) {
  const t = useT()
  const side = useSession(session, (s) => s.flow.side)
  const cmp = session.comparison!
  const rows = session.comparisonRows
  return (
    <div className="stage-card card compare" role="status">
      <span className="eyebrow">{t('cards.comparison.title')}</span>
      <div className="seg">
        <button className={side === 'without' ? 'on bad' : ''} aria-pressed={side === 'without'} onClick={() => session.showSide('without')}>
          {t('cards.comparison.without')}
        </button>
        <button className={side === 'with' ? 'on good' : ''} aria-pressed={side === 'with'} onClick={() => session.showSide('with')}>
          {t(msg('cards.comparison.with', { names: names(session, t) }))}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            <th>{t('cards.comparison.withoutShort')}</th>
            <th>{t('cards.comparison.withShort')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m}>
              <td>{t(session.level.winWhen.find((a) => a.metric === m)?.label ?? METRIC_TEXT[m])}</td>
              <td className="bad">{cmp.without.metrics[m]}</td>
              <td className="good">{cmp.with.metrics[m]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions">
        <button className="primary" onClick={() => session.finishLevel()}>
          {t('cards.comparison.finish')}
        </button>
      </div>
    </div>
  )
}

function WinCard({ session, onNext }: { session: GameSession; onNext?: () => void }) {
  const t = useT()
  const patterns = session.pluggedPatterns
  const title = !onNext ? t('cards.win.finishedGame') : patterns.length ? t(msg('cards.win.learned', { names: names(session, t) })) : t('cards.win.cafeWorks')
  return (
    <div className="stage-card card won" role="status">
      <span className="eyebrow">{t(onNext ? 'cards.win.levelDone' : 'cards.win.endOfTour')}</span>
      <h2>{title}</h2>
      {!onNext && <p className="muted">{t('cards.win.endBody')}</p>}
      {patterns.map((p) => (
        <div key={p}>
          <p className="muted">{t(PATTERNS[p].gist)}</p>
          <SeenIn pattern={p} lang={session.shownCodeLang} />
        </div>
      ))}
      <div className="actions">
        <button onClick={() => session.play()}>{t('cards.win.again')}</button>
        {onNext && (
          <button className="primary" onClick={onNext}>
            {t('cards.win.next')}
          </button>
        )}
      </div>
    </div>
  )
}
