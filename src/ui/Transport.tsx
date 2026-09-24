import { SPEEDS } from '../game/playback/Playback'
import type { GameSession } from '../game/session/GameSession'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useSession } from './useSession'

export function Transport({ session }: { session: GameSession }) {
  const t = useT()
  const playing = useSession(session, (s) => s.playback.playing)
  const speed = useSession(session, (s) => s.playback.speed)
  const tick = useSession(session, (s) => s.playback.timeline.tick)

  return (
    <div className="transport" role="toolbar" aria-label={t('Reproducción')}>
      <button title={t('Reiniciar (R)')} aria-label={t('Reiniciar')} onClick={() => session.reset()}>
        ↺
      </button>
      <button title={t('Paso atrás (←)')} aria-label={t('Paso atrás')} onClick={() => session.back()} disabled={tick === 0}>
        ◀︎
      </button>
      <button className="play" title={t('Reproducir / pausa (espacio)')} aria-label={t(playing ? 'Pausa' : 'Reproducir')} onClick={() => session.toggle()}>
        {playing ? '❚❚' : '▶︎'}
      </button>
      <button title={t('Paso adelante (→)')} aria-label={t('Paso adelante')} onClick={() => session.step()}>
        ▶︎|
      </button>
      <span className="sep" />
      {SPEEDS.map((s) => (
        <button key={s} className={`speed${s === speed ? ' on' : ''}`} aria-pressed={s === speed} aria-label={t(msg('Velocidad {s}×', { s }))} onClick={() => session.setSpeed(s)}>
          {s}×
        </button>
      ))}
      <span className="sep" />
      <span className="tick" aria-hidden>t {String(tick).padStart(4, '0')}</span>
    </div>
  )
}
