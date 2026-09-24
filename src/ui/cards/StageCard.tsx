import { useState } from 'react'
import { PATTERNS, type Evaluation, type MetricName } from '../../engine'
import { choiceLabel, isRight, type Prediction } from '../../game/learning/prediction'
import type { GameSession } from '../../game/session/GameSession'
import { msg, type Translate } from '../../i18n'
import { useT } from '../i18nContext'
import { SeenIn } from '../SeenIn'
import { useSession } from '../useSession'

// i18n
const METRIC_TEXT: Record<MetricName, string> = {
  spawned: 'pedidos creados',
  delivered: 'pedidos entregados',
  dropped: 'pedidos perdidos',
  invalidAtSink: 'pedidos equivocados',
  duplicatesAtSink: 'cobros duplicados',
  cancelled: 'pedidos cancelados a tiempo',
  maxLoad: 'carga máxima de un nodo',
  nodesTouched: 'nodos existentes modificados',
  nodes: 'piezas en el circuito',
}

// i18n
const OP_TEXT = {
  '==': 'debía ser',
  '<=': 'máximo',
  '>=': 'mínimo',
} as const

// i18n
const OUTCOME = {
  solves: { label: '¡Resuelve!', tone: 'good' },
  partial: { label: 'Parcial', tone: 'warn' },
  misfit: { label: 'No encaja', tone: 'bad' },
} as const

const names = (session: GameSession, t: Translate) => session.pluggedPatterns.map((p) => t(PATTERNS[p].name)).join(' + ')

// La tarjeta que acompaña cada etapa del flujo del nivel.
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
    <button className="close" onClick={onClose} aria-label={t('Cerrar')}>
      ×
    </button>
  ) : null
}

// Sin mouse no se puede arrastrar un cable: el botón "Conectar" hace la misma reparación.
function FailCard({ session, result, onClose }: { session: GameSession; result: Evaluation; onClose?: () => void }) {
  const t = useT()
  const repair = session.pendingRepairs[0]
  const wire = repair?.patch.add?.wires?.[0]
  const nodeLabel = (id: string) => session.playback.circuit.nodes.get(id)?.label ?? id
  return (
    <div className="stage-card card bad" role="status">
      <Close onClose={onClose} />
      <span className="eyebrow">{t('Algo salió mal')}</span>
      <Failures result={result} />
      {repair && <p className="hint">💡 {t(repair.prompt)}</p>}
      <div className="actions">
        <button onClick={() => session.play()}>{t('Reintentar')}</button>
        {wire && (
          <button className="link" onClick={() => session.connect(wire.from, wire.to)}>
            {t(msg('Conectar {from} → {to} sin arrastrar', { from: nodeLabel(wire.from), to: nodeLabel(wire.to) }))}
          </button>
        )}
      </div>
    </div>
  )
}

// Pistas de menos a más; la última dice qué patrón probar.
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
          💡 {t(shown === 0 ? 'Quiero una pista' : 'Otra pista')} ({shown + 1}/{ladder.length})
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
      <span className="eyebrow">{t('Problema detectado')}</span>
      <Failures result={result} />
      <p className="hint">{t('Arrastra un patrón del inventario al socket ⬡ que late sobre el circuito (o elígelo con clic o teclado). Probar uno equivocado también enseña.')}</p>
      <Hints session={session} />
    </div>
  )
}

// Antes de correr: el jugador se compromete con una respuesta.
function PredictionCard({ session }: { session: GameSession }) {
  const t = useT()
  const p = session.prediction!
  return (
    <div className="stage-card card predict" role="status">
      <span className="eyebrow">🔮 {t('Predice')}</span>
      <h3>{t(p.question)}</h3>
      <Choices prediction={p} onPick={(id) => session.predict(id)} />
      <div className="actions">
        <button className="link" onClick={() => session.skipPrediction()}>
          {t('Saltar y ver qué pasa')}
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

// Tras la corrida: la predicción contrastada con lo que pasó.
function PredictionResult({ prediction }: { prediction?: Prediction }) {
  const t = useT()
  if (!prediction?.guess) return null
  const right = isRight(prediction)
  return (
    <p className={`prediction-result ${right ? 'good' : 'bad'}`}>
      {right
        ? `🎯 ${t('Acertaste tu predicción')}`
        : `🔮 ${t(msg('Predijiste "{guess}"; fue "{answer}"', { guess: choiceLabel(prediction, prediction.guess) ?? '', answer: choiceLabel(prediction, prediction.answer) ?? '' }))}`}
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
            {t(session.ticket ? 'Siguiente: llega un cambio →' : 'Comparar sin/con patrón →')}
          </button>
        ) : option.outcome === 'solves' && pending.length ? (
          <span className="muted">{t(msg('Este socket quedó resuelto. Falta: {pending}.', { pending: pending.map((s) => t(s.label)).join(', ') }))}</span>
        ) : (
          <span className="muted">{t('Prueba otro patrón del inventario.')}</span>
        )}
      </div>
      {!solved && <Hints session={session} />}
    </div>
  )
}

function TicketCard({ session }: { session: GameSession }) {
  const t = useT()
  const applied = useSession(session, (s) => s.flow.ticketApplied)
  const done = useSession(session, (s) => s.flow.ticketDone)
  const touched = useSession(session, (s) => s.touched.length)
  const running = useSession(session, (s) => s.playback.playing)
  const prediction = session.prediction?.kind === 'touched' ? session.prediction : undefined
  return (
    <div className="stage-card card ticket" role="status">
      <span className="eyebrow">📋 {t('Ticket de cambio')}</span>
      <h3>{session.ticket && t(session.ticket.text)}</h3>
      {!applied && prediction && (
        <>
          <p>{t(prediction.question)}</p>
          <Choices prediction={prediction} onPick={(id) => session.predict(id)} />
          <div className="actions">
            <button className="link" onClick={() => session.skipPrediction()}>
              {t('Aplicar sin predecir')}
            </button>
          </div>
        </>
      )}
      {!applied && !prediction && (
        <div className="actions">
          <button className="primary" onClick={() => session.applyTicket()}>
            {t('Aplicar el cambio')}
          </button>
        </div>
      )}
      {applied && (
        <>
          <div className="big-stat">
            <b className={touched ? 'bad' : 'good'}>{touched}</b>
            <span>{t('nodos existentes modificados')}</span>
          </div>
          <PredictionResult prediction={prediction} />
          <p className="muted">{t(touched ? 'Hubo que abrir código que ya funcionaba.' : 'Solo se agregó una pieza nueva: nada existente cambió.')}</p>
          <div className="actions">
            <button className="primary" disabled={!done || running} onClick={() => session.continue()}>
              {t('Comparar sin/con patrón →')}
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
      <span className="eyebrow">{t('Comparación')}</span>
      <div className="seg">
        <button className={side === 'without' ? 'on bad' : ''} aria-pressed={side === 'without'} onClick={() => session.showSide('without')}>
          {t('Sin patrón')}
        </button>
        <button className={side === 'with' ? 'on good' : ''} aria-pressed={side === 'with'} onClick={() => session.showSide('with')}>
          {t(msg('Con {names}', { names: names(session, t) }))}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            <th>{t('sin')}</th>
            <th>{t('con')}</th>
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
          {t('Terminar nivel ✓')}
        </button>
      </div>
    </div>
  )
}

function WinCard({ session, onNext }: { session: GameSession; onNext?: () => void }) {
  const t = useT()
  const patterns = session.pluggedPatterns
  const title = !onNext ? t('¡Terminaste Pattern Circuit!') : patterns.length ? t(msg('Aprendiste {names}', { names: names(session, t) })) : t('¡La cafetería funciona!')
  return (
    <div className="stage-card card won" role="status">
      <span className="eyebrow">{t(onNext ? 'Nivel superado' : 'Fin del recorrido')}</span>
      <h2>{title}</h2>
      {!onNext && <p className="muted">{t('La cafetería entera corre sobre los patrones que fuiste enchufando. Tu cuaderno guarda lo que aprendiste de cada uno, también de los que no encajaban.')}</p>}
      {patterns.map((p) => (
        <div key={p}>
          <p className="muted">{t(PATTERNS[p].gist)}</p>
          <SeenIn info={PATTERNS[p].seenIn} />
        </div>
      ))}
      <div className="actions">
        <button onClick={() => session.play()}>{t('Ver de nuevo')}</button>
        {onNext && (
          <button className="primary" onClick={onNext}>
            {t('Siguiente nivel →')}
          </button>
        )}
      </div>
    </div>
  )
}
