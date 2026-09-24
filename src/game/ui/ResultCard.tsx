import { useEffect, useState } from 'react'
import type { MetricName } from '../../engine'
import type { GameSession } from '../session'
import { useSession } from './useSession'

const METRIC_TEXT: Record<MetricName, string> = {
  spawned: 'pedidos creados',
  delivered: 'pedidos entregados',
  dropped: 'pedidos perdidos',
  invalidAtSink: 'pedidos inválidos entregados',
  duplicatesAtSink: 'cobros duplicados',
  maxLoad: 'carga máxima de un nodo',
  nodesTouched: 'nodos modificados',
}

const OP_TEXT = { '==': 'debía ser', '<=': 'máximo', '>=': 'mínimo' } as const

export function ResultCard({ session, onNext }: { session: GameSession; onNext?: () => void }) {
  const result = useSession(session, (s) => s.result)
  const hint = useSession(session, (s) => s.pendingRepairs[0]?.prompt)
  const [hidden, setHidden] = useState(false)
  useEffect(() => setHidden(false), [result])
  if (!result || hidden) return null

  if (result.won) {
    return (
      <div className="result card won">
        <span className="eyebrow">Nivel superado</span>
        <h2>¡La cafetería funciona!</h2>
        <div className="stats">
          <span>
            <b>{result.metrics.delivered}</b> entregados
          </span>
          <span>
            <b>{result.metrics.dropped}</b> perdidos
          </span>
        </div>
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

  return (
    <div className="result card failed">
      <button className="close" onClick={() => setHidden(true)} aria-label="Cerrar">
        ×
      </button>
      <span className="eyebrow">Algo salió mal</span>
      <ul>
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
      {hint && <p className="hint">💡 {hint}</p>}
      <div className="actions">
        <button onClick={() => session.play()}>Reintentar</button>
      </div>
    </div>
  )
}
