import { SPEEDS } from '../game/playback/Playback'
import type { GameSession } from '../game/session/GameSession'
import { useSession } from './useSession'

export function Transport({ session }: { session: GameSession }) {
  const playing = useSession(session, (s) => s.playback.playing)
  const speed = useSession(session, (s) => s.playback.speed)
  const tick = useSession(session, (s) => s.playback.timeline.tick)

  return (
    <div className="transport" role="toolbar" aria-label="Reproducción">
      <button title="Reiniciar (R)" aria-label="Reiniciar" onClick={() => session.reset()}>
        ↺
      </button>
      <button title="Paso atrás (←)" aria-label="Paso atrás" onClick={() => session.back()} disabled={tick === 0}>
        ◀︎
      </button>
      <button className="play" title="Reproducir / pausa (espacio)" aria-label={playing ? 'Pausa' : 'Reproducir'} onClick={() => session.toggle()}>
        {playing ? '❚❚' : '▶︎'}
      </button>
      <button title="Paso adelante (→)" aria-label="Paso adelante" onClick={() => session.step()}>
        ▶︎|
      </button>
      <span className="sep" />
      {SPEEDS.map((s) => (
        <button key={s} className={`speed${s === speed ? ' on' : ''}`} aria-pressed={s === speed} aria-label={`Velocidad ${s}×`} onClick={() => session.setSpeed(s)}>
          {s}×
        </button>
      ))}
      <span className="sep" />
      <span className="tick" aria-hidden>t {String(tick).padStart(4, '0')}</span>
    </div>
  )
}
