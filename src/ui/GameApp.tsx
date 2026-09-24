import { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS } from '../levels'
import { NeonStage } from '../render/NeonStage'
import { GameSession } from '../game/session/GameSession'
import { BriefCard } from './BriefCard'
import { CodePanel } from './CodePanel'
import { ResultCard } from './ResultCard'
import { Transport } from './Transport'
import './game.css'

export default function GameApp() {
  const [levelId, setLevelId] = useState(LEVELS[0].id)
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = LEVELS[index + 1]
  const session = useMemo(() => new GameSession(LEVELS[index]), [index])
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let stage: NeonStage | undefined
    let cancelled = false
    NeonStage.create(host.current!, session).then((s) => (cancelled ? s.destroy() : (stage = s)))
    return () => {
      cancelled = true
      stage?.destroy()
    }
  }, [session])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return
      const actions: Record<string, () => void> = {
        ' ': () => session.toggle(),
        ArrowRight: () => session.step(),
        ArrowLeft: () => session.back(),
        r: () => session.reset(),
      }
      const action = actions[e.key]
      if (!action) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session])

  return (
    <div className="game">
      <header className="topbar">
        <div className="logo">
          <span className="dot" />
          Pattern Circuit
        </div>
        <select value={levelId} onChange={(e) => setLevelId(e.target.value)} aria-label="Nivel">
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.order}. {l.title}
            </option>
          ))}
        </select>
      </header>

      <main>
        <section className="stage-wrap">
          <div className="stage" ref={host} />
          <BriefCard key={session.level.id} session={session} />
          <ResultCard session={session} onNext={next ? () => setLevelId(next.id) : undefined} />
          <Legend />
          <Transport session={session} />
        </section>
        <CodePanel key={session.level.id} session={session} />
      </main>
    </div>
  )
}

function Legend() {
  return (
    <div className="legend">
      <span>
        <i className="pulse" /> pedido
      </span>
      <span>
        <i className="solid" /> depende de una clase concreta
      </span>
      <span>
        <i className="dashed" /> depende de una interfaz
      </span>
    </div>
  )
}
