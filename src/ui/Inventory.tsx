import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { FAMILY_NAMES, PATTERNS, type PatternId } from '../engine'
import { noteKey } from '../game/progress/progress'
import type { GameSession } from '../game/session/GameSession'
import type { NeonStage } from '../render/NeonStage'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useSession } from './useSession'

type Ghost = { pattern: PatternId; x: number; y: number; startX: number; startY: number; moved: boolean; over: boolean }

const OUTCOME_MARK = { solves: '✓', partial: '≈', misfit: '✗' } as const
// i18n
const OUTCOME_TEXT = {
  solves: 'resuelve',
  partial: 'parcial',
  misfit: 'no encaja',
} as const
const DRAG_THRESHOLD = 6

// Cartuchos de patrones: se arrastran al socket del canvas, o se enchufan con clic o teclado (Enter/Espacio).
// Un cartucho ya enchufado se desenchufa con otro clic.
export function Inventory({ session, stage }: { session: GameSession; stage?: NeonStage }) {
  const t = useT()
  const open = useSession(session, (s) => s.inventoryOpen)
  const plugs = useSession(session, (s) => s.flow.plugs)
  const notes = useSession(session, (s) => s.progress.notes)
  const [ghost, setGhost] = useState<Ghost>()
  const [warning, setWarning] = useState<string>()
  const warningTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const dragged = useRef(false) // el click que sigue a soltar un arrastre no debe volver a enchufar
  useEffect(() => () => clearTimeout(warningTimer.current), [])

  const sockets = session.sockets
  if (!sockets.length || !open) return null
  const patterns = [...new Set(sockets.flatMap((s) => s.inventory))]
  const socketOf = (id: PatternId) => Object.values(plugs).find((p) => p.pattern === id)?.socketId

  const warn = (text: string) => {
    clearTimeout(warningTimer.current)
    setWarning(text)
    warningTimer.current = setTimeout(() => setWarning(undefined), 1800)
  }

  const onClick = (pattern: PatternId, fromKeyboard: boolean) => {
    if (dragged.current && !fromKeyboard) return void (dragged.current = false)
    toggle(pattern)
  }

  const toggle = (pattern: PatternId) => {
    const socketId = socketOf(pattern)
    if (socketId) session.unplug(socketId)
    else session.plug(pattern)
  }

  const acceptingSocket = (pattern: PatternId, x: number, y: number) => {
    const socketId = stage?.socketAtClient(x, y)
    return socketId && session.accepts(pattern, socketId) ? socketId : undefined
  }

  const onDown = (pattern: PatternId) => (e: ReactPointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setGhost({ pattern, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, moved: false, over: false })
  }

  const onMove = (e: ReactPointerEvent) => {
    if (!ghost) return
    const moved = ghost.moved || Math.hypot(e.clientX - ghost.startX, e.clientY - ghost.startY) > DRAG_THRESHOLD
    const target = acceptingSocket(ghost.pattern, e.clientX, e.clientY)
    stage?.setDropHover(target)
    setGhost({ ...ghost, x: e.clientX, y: e.clientY, moved, over: !!target })
  }

  // Un clic sin arrastre lo resuelve onClick (así también funciona con teclado).
  const onUp = (e: ReactPointerEvent) => {
    if (!ghost) return
    dragged.current = ghost.moved
    const socketId = ghost.moved ? stage?.socketAtClient(e.clientX, e.clientY) : undefined
    if (socketId && !session.plug(ghost.pattern, socketId)) warn(t(msg('{pattern} no va en ese socket', { pattern: PATTERNS[ghost.pattern].name })))
    stage?.setDropHover(undefined)
    setGhost(undefined)
  }

  return (
    <>
      <div className="inventory card" role="group" aria-label={t('Inventario de patrones')}>
        <div className="inventory-head">
          <span className="eyebrow">{t('Inventario')}</span>
          <span className={`hint${warning ? ' warning' : ''}`} role="status">
            {warning ?? t(sockets.length > 1 ? 'Arrastra cada patrón a su socket ⬡' : 'Arrastra un patrón al socket ⬡')}
          </span>
        </div>
        <div className="cartridges">
          {patterns.map((id) => {
            const info = PATTERNS[id]
            const tried = notes.includes(noteKey(session.level.id, id))
            const outcome = tried ? session.outcomeOf(id) : undefined
            const plugged = !!socketOf(id)
            return (
              <button
                key={id}
                className={`cartridge ${info.family}${plugged ? ' plugged' : ''}${ghost?.pattern === id ? ' lifted' : ''}`}
                onPointerDown={onDown(id)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onClick={(e) => onClick(id, e.detail === 0)}
                aria-pressed={plugged}
                aria-label={`${t(info.name)}, ${t(FAMILY_NAMES[info.family])}${outcome ? `, ${t(msg('probado: {outcome}', { outcome: OUTCOME_TEXT[outcome] }))}` : ''}`}
                title={t(info.gist)}
              >
                <span className="stripe" />
                <span className="name">{t(info.name)}</span>
                <span className="family">{t(FAMILY_NAMES[info.family])}</span>
                {outcome && <span className={`mark ${outcome}`}>{OUTCOME_MARK[outcome]}</span>}
              </button>
            )
          })}
        </div>
      </div>
      {ghost?.moved && (
        <div className={`cartridge ghost ${PATTERNS[ghost.pattern].family}${ghost.over ? ' over' : ''}`} style={{ left: ghost.x, top: ghost.y }}>
          <span className="stripe" />
          <span className="name">{t(PATTERNS[ghost.pattern].name)}</span>
        </div>
      )}
    </>
  )
}
