import { SPEEDS, type GameSession } from '../session'
import { useSession } from './useSession'

export function Transport({ session }: { session: GameSession }) {
  const playing = useSession(session, (s) => s.playing)
  const speed = useSession(session, (s) => s.speed)
  const tick = useSession(session, (s) => s.timeline.tick)

  return (
    <div className="transport">
      <button title="Reiniciar (R)" onClick={() => session.reset()}>
        ↺
      </button>
      <button title="Paso atrás (←)" onClick={() => session.back()} disabled={tick === 0}>
        ◀︎
      </button>
      <button className="play" title="Reproducir / pausa (espacio)" onClick={() => session.toggle()}>
        {playing ? '❚❚' : '▶︎'}
      </button>
      <button title="Paso adelante (→)" onClick={() => session.step()}>
        ▶︎|
      </button>
      <span className="sep" />
      {SPEEDS.map((s) => (
        <button key={s} className={`speed${s === speed ? ' on' : ''}`} onClick={() => session.setSpeed(s)}>
          {s}×
        </button>
      ))}
      <span className="sep" />
      <span className="tick">t {String(tick).padStart(4, '0')}</span>
    </div>
  )
}
