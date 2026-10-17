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
    <div className="transport" role="toolbar" aria-label={t('ui.transport.label')}>
      <button title={t('ui.transport.restart.title')} aria-label={t('ui.transport.restart.label')} onClick={() => session.reset()}>
        ↺
      </button>
      <button title={t('ui.transport.back.title')} aria-label={t('ui.transport.back.label')} onClick={() => session.back()} disabled={tick === 0}>
        ◀︎
      </button>
      <button className="play" data-testid="play" data-playing={playing} title={t('ui.transport.play.title')} aria-label={t(playing ? 'ui.transport.pause' : 'ui.transport.play')} onClick={() => session.toggle()}>
        {playing ? '❚❚' : '▶︎'}
      </button>
      <button title={t('ui.transport.forward.title')} aria-label={t('ui.transport.forward.label')} onClick={() => session.step()}>
        ▶︎|
      </button>
      <span className="sep" />
      {SPEEDS.map((s) => (
        <button key={s} data-testid={`speed-${s}`} className={`speed${s === speed ? ' on' : ''}`} aria-pressed={s === speed} aria-label={t(msg('ui.transport.speed', { s }))} onClick={() => session.setSpeed(s)}>
          {s}×
        </button>
      ))}
      <span className="sep" />
      <span className="tick" aria-hidden>t {String(tick).padStart(4, '0')}</span>
    </div>
  )
}
