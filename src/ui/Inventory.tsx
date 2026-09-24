import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { FAMILY_NAMES, PATTERNS, type PatternId } from '../engine'
import { noteKey } from '../game/progress/progress'
import type { GameSession } from '../game/session/GameSession'
import type { NeonStage } from '../render/NeonStage'
import { useSession } from './useSession'

type Ghost = { pattern: PatternId; x: number; y: number; startX: number; startY: number; moved: boolean; over: boolean }

const OUTCOME_MARK = { solves: '✓', partial: '≈', misfit: '✗' } as const

// Cartuchos de patrones. Se arrastran al socket del canvas (o se enchufan con un clic).
export function Inventory({ session, stage }: { session: GameSession; stage?: NeonStage }) {
  const open = useSession(session, (s) => s.inventoryOpen)
  const plugs = useSession(session, (s) => s.flow.plugs)
  const notes = useSession(session, (s) => s.progress.notes)
  const [ghost, setGhost] = useState<Ghost>()
  const [warning, setWarning] = useState<string>()
  const sockets = session.sockets
  if (!sockets.length || !open) return null
  const patterns = [...new Set(sockets.flatMap((s) => s.inventory))]
  const plugged = new Set(Object.values(plugs).map((p) => p.pattern))
  const outcomeOf = (id: PatternId) => sockets.find((s) => plugs[s.id]?.pattern === id)?.options[id]?.outcome ?? sockets.find((s) => s.options[id])?.options[id]?.outcome
  const acceptingSocket = (id: PatternId, x: number, y: number) => {
    const socketId = stage?.socketAtClient(x, y)
    return socketId && sockets.find((s) => s.id === socketId)?.options[id] ? socketId : undefined
  }

  const onDown = (pattern: PatternId) => (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setGhost({ pattern, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, over: false })
  }

  const onMove = (e: ReactPointerEvent) => {
    if (!ghost) return
    const moved = ghost.moved || Math.hypot(e.clientX - ghost.startX, e.clientY - ghost.startY) > 6
    const target = acceptingSocket(ghost.pattern, e.clientX, e.clientY)
    stage?.setDropHover(target)
    setGhost({ ...ghost, x: e.clientX, y: e.clientY, moved, over: !!target })
  }

  const onUp = (e: ReactPointerEvent) => {
    if (!ghost) return
    const socketId = stage?.socketAtClient(e.clientX, e.clientY)
    if (!ghost.moved) session.plug(ghost.pattern)
    else if (socketId && !session.plug(ghost.pattern, socketId)) {
      setWarning(`${PATTERNS[ghost.pattern].name} no va en ese socket`)
      setTimeout(() => setWarning(undefined), 1800)
    }
    stage?.setDropHover(undefined)
    setGhost(undefined)
  }

  return (
    <>
      <div className="inventory card">
        <div className="inventory-head">
          <span className="eyebrow">Inventario</span>
          <span className={`hint${warning ? ' warning' : ''}`}>{warning ?? (sockets.length > 1 ? 'Arrastra cada patrón a su socket ⬡' : 'Arrastra un patrón al socket ⬡')}</span>
        </div>
        <div className="cartridges">
          {patterns.map((id) => {
            const info = PATTERNS[id]
            const tried = notes.includes(noteKey(session.level.id, id))
            const outcome = outcomeOf(id)
            return (
              <button
                key={id}
                className={`cartridge ${info.family}${plugged.has(id) ? ' plugged' : ''}${ghost?.pattern === id ? ' lifted' : ''}`}
                onPointerDown={onDown(id)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                title={info.gist}
              >
                <span className="stripe" />
                <span className="name">{info.name}</span>
                <span className="family">{FAMILY_NAMES[info.family]}</span>
                {tried && outcome && <span className={`mark ${outcome}`}>{OUTCOME_MARK[outcome]}</span>}
              </button>
            )
          })}
        </div>
      </div>
      {ghost?.moved && (
        <div className={`cartridge ghost ${PATTERNS[ghost.pattern].family}${ghost.over ? ' over' : ''}`} style={{ left: ghost.x, top: ghost.y }}>
          <span className="stripe" />
          <span className="name">{PATTERNS[ghost.pattern].name}</span>
        </div>
      )}
    </>
  )
}
