import { useState } from 'react'
import { PATTERNS, type Evaluation, type MetricName } from '../../engine'
import type { GameSession } from '../../game/session/GameSession'
import { useSession } from '../useSession'

const METRIC_TEXT: Record<MetricName, string> = {
  spawned: 'pedidos creados',
  delivered: 'pedidos entregados',
  dropped: 'pedidos perdidos',
  invalidAtSink: 'pedidos equivocados',
  duplicatesAtSink: 'cobros duplicados',
  maxLoad: 'carga máxima de un nodo',
  nodesTouched: 'nodos existentes modificados',
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
  const plugged = useSession(session, (s) => s.flow.plugged)
  const [dismissed, setDismissed] = useState<Evaluation>()

  if (stage === 'complete') return <WinCard session={session} onNext={onNext} />
  if (stage === 'change') return <TicketCard session={session} />
  if (stage === 'compare') return <CompareCard session={session} />
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
            <b>{r.actual}</b> {METRIC_TEXT[r.assertion.metric]}{' '}
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

function FailCard({ session, result, onClose }: { session: GameSession; result: Evaluation; onClose?: () => void }) {
  const hint = session.pendingRepairs[0]?.prompt
  return (
    <div className="stage-card card bad">
      <Close onClose={onClose} />
      <span className="eyebrow">Algo salió mal</span>
      <Failures result={result} />
      {hint && <p className="hint">💡 {hint}</p>}
      <div className="actions">
        <button onClick={() => session.play()}>Reintentar</button>
      </div>
    </div>
  )
}

function ProblemCard({ result, onClose }: { result: Evaluation; onClose?: () => void }) {
  return (
    <div className="stage-card card bad">
      <Close onClose={onClose} />
      <span className="eyebrow">Problema detectado</span>
      <Failures result={result} />
      <p className="hint">Arrastra un patrón del inventario al socket ⬡ que late sobre el circuito. Probar uno equivocado también enseña.</p>
    </div>
  )
}

function NoteCard({ session, onClose }: { session: GameSession; onClose?: () => void }) {
  const option = session.pluggedOption!
  const solved = session.flow.solved
  const outcome = OUTCOME[option.outcome]
  return (
    <div className={`stage-card card ${outcome.tone}`}>
      <Close onClose={solved ? undefined : onClose} />
      <span className={`badge ${outcome.tone}`}>{outcome.label}</span>
      <h3>{option.note.title}</h3>
      <p>{option.note.body}</p>
      {!solved && session.result && <Failures result={session.result} />}
      <div className="actions">
        {solved ? (
          <button className="primary" onClick={() => session.continue()}>
            {session.ticket ? 'Siguiente: llega un cambio →' : 'Comparar sin/con patrón →'}
          </button>
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
  return (
    <div className="stage-card card ticket">
      <span className="eyebrow">📋 Ticket de cambio</span>
      <h3>{session.ticket?.text}</h3>
      {!applied && (
        <>
          <p>¿Cuántas piezas que ya funcionaban hay que abrir para cumplirlo?</p>
          <div className="actions">
            <button className="primary" onClick={() => session.applyTicket()}>
              Aplicar el cambio
            </button>
          </div>
        </>
      )}
      {applied && (
        <>
          <div className="big-stat">
            <b className={touched ? 'bad' : 'good'}>{touched}</b>
            <span>nodos existentes modificados</span>
          </div>
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

const COMPARE_ROWS: MetricName[] = ['dropped', 'duplicatesAtSink', 'invalidAtSink', 'nodesTouched']

function CompareCard({ session }: { session: GameSession }) {
  const side = useSession(session, (s) => s.flow.side)
  const cmp = session.comparison!
  const name = PATTERNS[session.flow.plugged!.pattern].name
  const rows = COMPARE_ROWS.filter((m) => cmp.with.metrics[m] !== 0 || cmp.without.metrics[m] !== 0)
  return (
    <div className="stage-card card compare">
      <span className="eyebrow">Comparación</span>
      <div className="seg">
        <button className={side === 'without' ? 'on bad' : ''} onClick={() => session.showSide('without')}>
          Sin patrón
        </button>
        <button className={side === 'with' ? 'on good' : ''} onClick={() => session.showSide('with')}>
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
              <td>{METRIC_TEXT[m]}</td>
              <td className={cmp.without.metrics[m] > cmp.with.metrics[m] ? 'bad' : ''}>{cmp.without.metrics[m]}</td>
              <td className={cmp.with.metrics[m] < cmp.without.metrics[m] ? 'good' : ''}>{cmp.with.metrics[m]}</td>
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
  const plugged = session.flow.plugged
  return (
    <div className="stage-card card won">
      <span className="eyebrow">Nivel superado</span>
      <h2>{plugged ? `Aprendiste ${PATTERNS[plugged.pattern].name}` : '¡La cafetería funciona!'}</h2>
      {plugged && <p className="muted">{PATTERNS[plugged.pattern].gist}</p>}
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
