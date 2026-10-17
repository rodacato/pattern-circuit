import type { GameSession } from '../game/session/GameSession'
import type { NeonStage } from '../render/NeonStage'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useSession } from './useSession'

const ZOOM_STEP = 1.25

// What the canvas offers to the pointer, as a list: inspect a node, follow a pulse, move the camera.
export function CircuitExplorer({ session, stage }: { session: GameSession; stage?: NeonStage }) {
  const t = useT()
  const circuit = useSession(session, (s) => s.playback.circuit)
  const inspected = useSession(session, (s) => s.playback.inspected)
  const followed = useSession(session, (s) => s.playback.followed)
  // A string keeps the snapshot stable between ticks that do not change which pulses are alive.
  const alive = useSession(session, (s) =>
    s.playback.timeline.current.state.pulses
      .filter((p) => p.status === 'alive')
      .map((p) => p.id)
      .join(','),
  )
  const pulses = alive ? alive.split(',').map(Number) : []
  const label = (id: string) => t(circuit.nodes.get(id)?.label ?? id)

  return (
    <details className="explorer card">
      <summary title={t('ui.explorer.hint')}>⌨ {t('ui.explorer.title')}</summary>
      <div className="explorer-body">
        <h3 className="eyebrow">{t('ui.explorer.nodes')}</h3>
        <ul>
          {[...circuit.nodes.values()].map((n) => {
            const targets = [...new Set((circuit.outgoing.get(n.id) ?? []).map((w) => label(w.to)))]
            return (
              <li key={n.id}>
                <button aria-pressed={inspected === n.id} onClick={() => session.inspect(inspected === n.id ? undefined : n.id)}>
                  <span className="name">{label(n.id)}</span>
                  {n.className && <code>{n.className}</code>}
                </button>
                {targets.length > 0 && <span className="sends">{t(msg('ui.explorer.sendsTo', { targets: targets.join(', ') }))}</span>}
              </li>
            )
          })}
        </ul>
        <h3 className="eyebrow">{t('ui.explorer.pulses')}</h3>
        {pulses.length ? (
          <ul className="pulses">
            {pulses.map((id) => (
              <li key={id}>
                <button aria-pressed={followed === id} onClick={() => session.follow(id)}>
                  {t(msg('ui.explorer.pulse', { id }))}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t('ui.explorer.noPulses')}</p>
        )}
        <div className="camera-buttons">
          <button onClick={() => stage?.zoomBy(ZOOM_STEP)}>{t('ui.explorer.zoomIn')}</button>
          <button onClick={() => stage?.zoomBy(1 / ZOOM_STEP)}>{t('ui.explorer.zoomOut')}</button>
          <button onClick={() => stage?.reframe()}>{t('ui.explorer.reframe')}</button>
        </div>
      </div>
    </details>
  )
}
