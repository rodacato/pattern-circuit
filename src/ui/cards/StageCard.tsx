import { useState } from 'react'
import { PATTERNS, type Evaluation, type MetricName } from '../../engine'
import { choiceLabel, isRight, type Prediction } from '../../game/learning/prediction'
import type { GameSession } from '../../game/session/GameSession'
import { useSession } from '../useSession'

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

const OP_TEXT = { '==': 'debía ser', '<=': 'máximo', '>=': 'mínimo' } as const
const OUTCOME = {
  solves: { label: '¡Resuelve!', tone: 'good' },
  partial: { label: 'Parcial', tone: 'warn' },
  misfit: { label: 'No encaja', tone: 'bad' },
} as const

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
  if (stage === 'choose') return <ProblemCard result={result} onClose={close} />
  return <FailCard session={session} result={result} onClose={close} />
}

function Failures({ result }: { result: Evaluation }) {
  return (
    <ul className="failures">
      {result.results
        .filter((r) => !r.pass)
        .map((r) => (
          <li key={r.assertion.metric}>
            <b>{r.actual}</b> {r.assertion.label ?? METRIC_TEXT[r.assertion.metric]}{' '}
            <span className="expected">
              ({OP_TEXT[r.assertion.op]} {r.assertion.value})
            </span>
          </li>
        ))}
    </ul>
  )
}

function Close({ onClose }: { onClose?: () => void }) {
  return onClose ? (
    <button className="close" onClick={onClose} aria-label="Cerrar">
      ×
    </button>
  ) : null
}

// Sin mouse no se puede arrastrar un cable: el botón "Conectar" hace la misma reparación.
function FailCard({ session, result, onClose }: { session: GameSession; result: Evaluation; onClose?: () => void }) {
  const repair = session.pendingRepairs[0]
  const wire = repair?.patch.add?.wires?.[0]
  const nodeLabel = (id: string) => session.playback.circuit.nodes.get(id)?.label ?? id
  return (
    <div className="stage-card card bad" role="status">
      <Close onClose={onClose} />
      <span className="eyebrow">Algo salió mal</span>
      <Failures result={result} />
      {repair && <p className="hint">💡 {repair.prompt}</p>}
      <div className="actions">
        <button onClick={() => session.play()}>Reintentar</button>
        {wire && (
          <button className="link" onClick={() => session.connect(wire.from, wire.to)}>
            Conectar {nodeLabel(wire.from)} → {nodeLabel(wire.to)} sin arrastrar
          </button>
        )}
      </div>
    </div>
  )
}

function ProblemCard({ result, onClose }: { result: Evaluation; onClose?: () => void }) {
  return (
    <div className="stage-card card bad" role="status">
      <Close onClose={onClose} />
      <span className="eyebrow">Problema detectado</span>
      <Failures result={result} />
      <p className="hint">Arrastra un patrón del inventario al socket ⬡ que late sobre el circuito (o elígelo con clic o teclado). Probar uno equivocado también enseña.</p>
    </div>
  )
}

// Antes de correr: el jugador se compromete con una respuesta.
function PredictionCard({ session }: { session: GameSession }) {
  const p = session.prediction!
  return (
    <div className="stage-card card predict" role="status">
      <span className="eyebrow">🔮 Predice</span>
      <h3>{p.question}</h3>
      <Choices prediction={p} onPick={(id) => session.predict(id)} />
      <div className="actions">
        <button className="link" onClick={() => session.skipPrediction()}>
          Saltar y ver qué pasa
        </button>
      </div>
    </div>
  )
}

function Choices({ prediction, onPick }: { prediction: Prediction; onPick: (id: string) => void }) {
  return (
    <div className="choices">
      {prediction.choices.map((c) => (
        <button key={c.id} onClick={() => onPick(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  )
}

// Tras la corrida: la predicción contrastada con lo que pasó.
function PredictionResult({ prediction }: { prediction?: Prediction }) {
  if (!prediction?.guess) return null
  const right = isRight(prediction)
  return (
    <p className={`prediction-result ${right ? 'good' : 'bad'}`}>
      {right ? '🎯 Acertaste tu predicción' : `🔮 Predijiste "${choiceLabel(prediction, prediction.guess)}"; fue "${choiceLabel(prediction, prediction.answer)}"`}
    </p>
  )
}

function NoteCard({ session, onClose }: { session: GameSession; onClose?: () => void }) {
  const option = session.pluggedOption!
  const solved = session.flow.solved
  const outcome = OUTCOME[option.outcome]
  const pending = session.pendingSockets
  return (
    <div className={`stage-card card ${outcome.tone}`} role="status">
      <Close onClose={solved ? undefined : onClose} />
      <span className={`badge ${outcome.tone}`}>{outcome.label}</span>
      <PredictionResult prediction={session.prediction?.kind === 'outcome' ? session.prediction : undefined} />
      <h3>{option.note.title}</h3>
      <p>{option.note.body}</p>
      {!solved && session.result && <Failures result={session.result} />}
      <div className="actions">
        {solved ? (
          <button className="primary" onClick={() => session.continue()}>
            {session.ticket ? 'Siguiente: llega un cambio →' : 'Comparar sin/con patrón →'}
          </button>
        ) : option.outcome === 'solves' && pending.length ? (
          <span className="muted">Este socket quedó resuelto. Falta: {pending.map((s) => s.label).join(', ')}.</span>
        ) : (
          <span className="muted">Prueba otro patrón del inventario.</span>
        )}
      </div>
    </div>
  )
}

function TicketCard({ session }: { session: GameSession }) {
  const applied = useSession(session, (s) => s.flow.ticketApplied)
  const done = useSession(session, (s) => s.flow.ticketDone)
  const touched = useSession(session, (s) => s.touched.length)
  const running = useSession(session, (s) => s.playback.playing)
  const prediction = session.prediction?.kind === 'touched' ? session.prediction : undefined
  return (
    <div className="stage-card card ticket" role="status">
      <span className="eyebrow">📋 Ticket de cambio</span>
      <h3>{session.ticket?.text}</h3>
      {!applied && prediction && (
        <>
          <p>{prediction.question}</p>
          <Choices prediction={prediction} onPick={(id) => session.predict(id)} />
          <div className="actions">
            <button className="link" onClick={() => session.skipPrediction()}>
              Aplicar sin predecir
            </button>
          </div>
        </>
      )}
      {!applied && !prediction && (
        <div className="actions">
          <button className="primary" onClick={() => session.applyTicket()}>
            Aplicar el cambio
          </button>
        </div>
      )}
      {applied && (
        <>
          <div className="big-stat">
            <b className={touched ? 'bad' : 'good'}>{touched}</b>
            <span>nodos existentes modificados</span>
          </div>
          <PredictionResult prediction={prediction} />
          <p className="muted">{touched ? 'Hubo que abrir código que ya funcionaba.' : 'Solo se agregó una pieza nueva: nada existente cambió.'}</p>
          <div className="actions">
            <button className="primary" disabled={!done || running} onClick={() => session.continue()}>
              Comparar sin/con patrón →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CompareCard({ session }: { session: GameSession }) {
  const side = useSession(session, (s) => s.flow.side)
  const cmp = session.comparison!
  const name = session.pluggedPatterns.map((p) => PATTERNS[p].name).join(' + ')
  const rows = session.comparisonRows
  return (
    <div className="stage-card card compare" role="status">
      <span className="eyebrow">Comparación</span>
      <div className="seg">
        <button className={side === 'without' ? 'on bad' : ''} aria-pressed={side === 'without'} onClick={() => session.showSide('without')}>
          Sin patrón
        </button>
        <button className={side === 'with' ? 'on good' : ''} aria-pressed={side === 'with'} onClick={() => session.showSide('with')}>
          Con {name}
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            <th>sin</th>
            <th>con</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m}>
              <td>{session.level.winWhen.find((a) => a.metric === m)?.label ?? METRIC_TEXT[m]}</td>
              <td className="bad">{cmp.without.metrics[m]}</td>
              <td className="good">{cmp.with.metrics[m]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="actions">
        <button className="primary" onClick={() => session.finishLevel()}>
          Terminar nivel ✓
        </button>
      </div>
    </div>
  )
}

function WinCard({ session, onNext }: { session: GameSession; onNext?: () => void }) {
  const patterns = session.pluggedPatterns
  return (
    <div className="stage-card card won" role="status">
      <span className="eyebrow">{onNext ? 'Nivel superado' : 'Fin del recorrido'}</span>
      <h2>{!onNext ? '¡Terminaste Pattern Circuit!' : patterns.length ? `Aprendiste ${patterns.map((p) => PATTERNS[p].name).join(' + ')}` : '¡La cafetería funciona!'}</h2>
      {!onNext && <p className="muted">La cafetería entera corre sobre los patrones que fuiste enchufando. Tu cuaderno guarda lo que aprendiste de cada uno, también de los que no encajaban.</p>}
      {patterns.map((p) => (
        <p key={p} className="muted">
          {PATTERNS[p].gist}
        </p>
      ))}
      <div className="actions">
        <button onClick={() => session.play()}>Ver de nuevo</button>
        {onNext && (
          <button className="primary" onClick={onNext}>
            Siguiente nivel →
          </button>
        )}
      </div>
    </div>
  )
}
