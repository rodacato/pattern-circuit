import { useState } from 'react'
import type { GameSession } from '../game/session/GameSession'
import { useSession } from './useSession'

export function BriefCard({ session }: { session: GameSession }) {
  const { level } = session
  const done = useSession(session, (s) => [...s.actions].join(','))
  const [open, setOpen] = useState(true)
  const completed = level.checklist.filter((c) => done.split(',').includes(c.on)).length

  return (
    <div className={`brief card${open ? '' : ' closed'}`}>
      <button className="brief-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="eyebrow">
          Nivel {level.order} · {level.chapter}
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
          {level.sockets.length > 0 && (
            <p className="soon">Los sockets para enchufar patrones llegan en la fase 3. Por ahora puedes ver el problema.</p>
          )}
        </>
      )}
    </div>
  )
}
