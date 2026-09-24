import { useEffect, useMemo, useRef, useState } from 'react'
import { KeyValueProgressStore } from '../game/progress/progress'
import { GameSession } from '../game/session/GameSession'
import { chapterName, LEVELS } from '../levels'
import { NeonStage } from '../render/NeonStage'
import { BriefCard } from './BriefCard'
import { StageCard } from './cards/StageCard'
import { CodePanel } from './CodePanel'
import { Inventory } from './Inventory'
import { Notebook } from './Notebook'
import { Transport } from './Transport'
import { useSession } from './useSession'
import './game.css'

const progressStore = new KeyValueProgressStore(window.localStorage)

export default function GameApp() {
  const [levelId, setLevelId] = useState(() => {
    const done = progressStore.load().completed
    return (LEVELS.find((l) => !done.includes(l.id)) ?? LEVELS[0]).id
  })
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = LEVELS[index + 1]
  const session = useMemo(() => new GameSession(LEVELS[index], progressStore), [index])
  const host = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<NeonStage>()
  const [notebookOpen, setNotebookOpen] = useState(false)
  const progress = useSession(session, (s) => s.progress)

  useEffect(() => {
    let created: NeonStage | undefined
    let cancelled = false
    NeonStage.create(host.current!, session).then((s) => {
      if (cancelled) return s.destroy()
      created = s
      setStage(s)
    })
    return () => {
      cancelled = true
      created?.destroy()
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
        <div className="topbar-actions">
          <button className="notebook-button" onClick={() => setNotebookOpen(true)}>
            📓 Cuaderno <span>{progress.notes.length}</span>
          </button>
          <select value={levelId} onChange={(e) => setLevelId(e.target.value)} aria-label="Nivel">
            {[...new Set(LEVELS.map((l) => l.chapter))].map((chapter) => (
              <optgroup key={chapter} label={chapterName(chapter)}>
                {LEVELS.filter((l) => l.chapter === chapter).map((l) => (
                  <option key={l.id} value={l.id}>
                    {progress.completed.includes(l.id) ? '✓ ' : ''}
                    {l.order}. {l.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </header>

      <main>
        <section className="stage-wrap">
          <div className="stage" ref={host} />
          <BriefCard key={session.level.id} session={session} />
          <StageCard key={`card-${session.level.id}`} session={session} onNext={next ? () => setLevelId(next.id) : undefined} />
          <Inventory session={session} stage={stage} />
          <Legend />
          <Transport session={session} />
        </section>
        <CodePanel key={session.level.id} session={session} />
      </main>

      {notebookOpen && <Notebook levels={LEVELS} notes={progress.notes} onClose={() => setNotebookOpen(false)} />}
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
