import { useState } from 'react'
import { chapterName } from '../levels'
import { stagesFor, type Stage } from '../game/flow/levelFlow'
import type { GameSession } from '../game/session/GameSession'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useSession } from './useSession'

// i18n
const STAGE_LABEL: Record<Exclude<Stage, 'complete'>, string> = {
  observe: 'Observar',
  choose: 'Elegir patrón',
  change: 'Cambio',
  compare: 'Comparar',
}

export function BriefCard({ session }: { session: GameSession }) {
  const t = useT()
  const { level } = session
  const done = useSession(session, (s) => [...s.actions].join(',')) // string: el selector debe ser estable
  const [open, setOpen] = useState(true)
  const completed = level.checklist.filter((c) => done.split(',').includes(c.on)).length
  const stage = useSession(session, (s) => s.flow.stage)
  const steps = stagesFor(level)
  const current = stage === 'complete' ? steps.length : steps.indexOf(stage)

  return (
    <div className={`brief card${open ? '' : ' closed'}`}>
      <button className="brief-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="eyebrow">
          {t(msg('Nivel {n} · {chapter}', { n: level.order, chapter: chapterName(level.chapter) }))}
        </span>
        <span className="title">{t(level.title)}</span>
        {level.checklist.length > 0 && (
          <span className="count">
            {completed}/{level.checklist.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <p className="problem">{t(level.brief.problem)}</p>
          <p className="goal">
            <strong>{t('Objetivo')}</strong> {t(level.brief.goal)}
          </p>
          {level.checklist.length > 0 && (
            <ul className="checklist">
              {level.checklist.map((c) => {
                const ok = done.split(',').includes(c.on)
                return (
                  <li key={c.on} className={ok ? 'ok' : ''}>
                    <span className="box">{ok ? '✓' : ''}</span>
                    {t(c.text)}
                  </li>
                )
              })}
            </ul>
          )}
          {steps.length > 1 && (
            <ol className="stages">
              {steps.map((st, i) => (
                <li key={st} className={i < current ? 'done' : i === current ? 'now' : ''} aria-current={i === current ? 'step' : undefined}>
                  {t(STAGE_LABEL[st])}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  )
}
