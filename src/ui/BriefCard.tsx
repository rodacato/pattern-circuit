import { useState } from 'react'
import type { Level } from '../engine'
import { chapterName } from '../levels'
import type { Stage } from '../game/flow/levelFlow'
import type { GameSession } from '../game/session/GameSession'
import { useSession } from './useSession'

const STAGES: { id: Stage; label: string; when: (l: Level) => boolean }[] = [
  { id: 'observe', label: 'Observar', when: () => true },
  { id: 'choose', label: 'Elegir patrón', when: (l) => l.sockets.length > 0 },
  { id: 'change', label: 'Cambio', when: (l) => l.changeTickets.length > 0 },
  { id: 'compare', label: 'Comparar', when: (l) => l.sockets.length > 0 },
]

export function BriefCard({ session }: { session: GameSession }) {
  const { level } = session
  const done = useSession(session, (s) => [...s.actions].join(','))
  const [open, setOpen] = useState(true)
  const completed = level.checklist.filter((c) => done.split(',').includes(c.on)).length
  const stage = useSession(session, (s) => s.flow.stage)
  const steps = STAGES.filter((st) => st.when(level))
  const current = stage === 'complete' ? steps.length : steps.findIndex((st) => st.id === stage)

  return (
    <div className={`brief card${open ? '' : ' closed'}`}>
      <button className="brief-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="eyebrow">
          Nivel {level.order} · {chapterName(level.chapter)}
        </span>
        <span className="title">{level.title}</span>
        {level.checklist.length > 0 && (
          <span className="count">
            {completed}/{level.checklist.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <p className="problem">{level.brief.problem}</p>
          <p className="goal">
            <strong>Objetivo</strong> {level.brief.goal}
          </p>
          {level.checklist.length > 0 && (
            <ul className="checklist">
              {level.checklist.map((c) => {
                const ok = done.split(',').includes(c.on)
                return (
                  <li key={c.on} className={ok ? 'ok' : ''}>
                    <span className="box">{ok ? '✓' : ''}</span>
                    {c.text}
                  </li>
                )
              })}
            </ul>
          )}
          {steps.length > 1 && (
            <ol className="stages">
              {steps.map((st, i) => (
                <li key={st.id} className={i < current ? 'done' : i === current ? 'now' : ''}>
                  {st.label}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  )
}
