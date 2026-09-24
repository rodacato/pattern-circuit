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
  const plugged = useSession(session, (s) => s.flow.plugged?.pattern)
  const notes = useSession(session, (s) => s.progress.notes)
  const [ghost, setGhost] = useState<Ghost>()
  const socket = session.socket
  if (!socket || !open) return null

  const onDown = (pattern: PatternId) => (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setGhost({ pattern, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, over: false })
  }

  const onMove = (e: ReactPointerEvent) => {
    if (!ghost) return
    const moved = ghost.moved || Math.hypot(e.clientX - ghost.startX, e.clientY - ghost.startY) > 6
    const over = !!stage?.socketAtClient(e.clientX, e.clientY)
    stage?.setDropHover(over)
    setGhost({ ...ghost, x: e.clientX, y: e.clientY, moved, over })
  }

  const onUp = (e: ReactPointerEvent) => {
    if (!ghost) return
    if (!ghost.moved || stage?.socketAtClient(e.clientX, e.clientY)) session.plug(ghost.pattern)
    stage?.setDropHover(false)
    setGhost(undefined)
  }

  return (
    <>
      <div className="inventory card">
        <div className="inventory-head">
          <span className="eyebrow">Inventario</span>
          <span className="hint">Arrastra un patrón al socket ⬡</span>
        </div>
        <div className="cartridges">
          {socket.inventory.map((id) => {
            const info = PATTERNS[id]
            const tried = notes.includes(noteKey(session.level.id, id))
            const outcome = socket.options[id]?.outcome
            return (
              <button
                key={id}
                className={`cartridge ${info.family}${plugged === id ? ' plugged' : ''}${ghost?.pattern === id ? ' lifted' : ''}`}
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
