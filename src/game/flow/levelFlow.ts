import type { LevelDef, PatternId, SocketDef, SocketOption, Variant } from '../../engine'

// observar el problema → elegir patrón → aplicar un cambio → comparar → completado.
// Las etapas que el nivel no necesita se saltan: sin sockets no hay "elegir", sin tickets no hay "cambio".
export type Stage = 'observe' | 'choose' | 'change' | 'compare' | 'complete'
export type Side = 'without' | 'with'
type Plugged = { socketId: string; pattern: PatternId; outcome: SocketOption['outcome'] }

export type FlowState = {
  stage: Stage
  runs: number
  plugs: Record<string, Plugged> // socket → patrón enchufado
  last?: string // socket enchufado más recientemente
  solved: boolean // la última corrida, con todos los sockets resueltos, cumplió los objetivos
  ticketApplied: boolean
  ticketDone: boolean
  side: Side
}

export type FlowEvent =
  | { type: 'run-finished'; won: boolean }
  | { type: 'plug'; socketId: string; pattern: PatternId; outcome: SocketOption['outcome'] }
  | { type: 'unplug'; socketId: string }
  | { type: 'apply-ticket' }
  | { type: 'continue' }
  | { type: 'compare'; side: Side }
  | { type: 'finish' }

type LevelShape = Pick<LevelDef, 'sockets' | 'changeTickets'>

export const initialFlow = (): FlowState => ({ stage: 'observe', runs: 0, plugs: {}, solved: false, ticketApplied: false, ticketDone: false, side: 'with' })

const allSolved = (level: LevelShape, s: FlowState) => level.sockets.every((k) => s.plugs[k.id]?.outcome === 'solves')

export function reduceFlow(level: LevelShape, s: FlowState, e: FlowEvent): FlowState {
  const hasSockets = level.sockets.length > 0
  switch (e.type) {
    case 'run-finished': {
      const next = { ...s, runs: s.runs + 1 }
      if (s.stage === 'observe') {
        if (hasSockets) return { ...next, stage: 'choose' }
        return e.won ? { ...next, stage: 'complete' } : next
      }
      if (s.stage === 'choose') return { ...next, solved: e.won && allSolved(level, s) }
      if (s.stage === 'change' && s.ticketApplied) return { ...next, ticketDone: e.won }
      return next
    }
    case 'plug':
      if (s.stage !== 'choose') return s
      return { ...s, plugs: { ...s.plugs, [e.socketId]: { socketId: e.socketId, pattern: e.pattern, outcome: e.outcome } }, last: e.socketId, solved: false }
    case 'unplug': {
      if (s.stage !== 'choose') return s
      const plugs = { ...s.plugs }
      delete plugs[e.socketId]
      return { ...s, plugs, last: s.last === e.socketId ? undefined : s.last, solved: false }
    }
    case 'continue':
      if (s.stage === 'choose' && s.solved) return { ...s, stage: level.changeTickets.length ? 'change' : 'compare', side: 'with' }
      if (s.stage === 'change' && s.ticketDone) return { ...s, stage: 'compare', side: 'with' }
      return s
    case 'apply-ticket':
      return s.stage === 'change' ? { ...s, ticketApplied: true, ticketDone: false } : s
    case 'compare':
      return s.stage === 'compare' ? { ...s, side: e.side } : s
    case 'finish':
      return s.stage === 'compare' ? { ...s, stage: 'complete' } : s
  }
}

// Etapas que el jugador verá en este nivel, en orden (las mismas reglas que salta el reducer).
export function stagesFor(level: LevelShape): Exclude<Stage, 'complete'>[] {
  const hasSockets = level.sockets.length > 0
  return ['observe', ...(hasSockets ? (['choose'] as const) : []), ...(level.changeTickets.length ? (['change'] as const) : []), ...(hasSockets ? (['compare'] as const) : [])]
}

// Sin socket explícito, un patrón va al primero que lo acepte, prefiriendo uno aún sin resolver.
export function targetSocket(level: LevelShape, s: FlowState, pattern: PatternId, socketId?: string): SocketDef | undefined {
  const accepting = level.sockets.filter((k) => k.options[pattern])
  if (socketId) return accepting.find((k) => k.id === socketId)
  return accepting.find((k) => s.plugs[k.id]?.outcome !== 'solves') ?? accepting[0]
}

// Patrones enchufados en el orden en que el nivel declara sus sockets.
export const pluggedPatterns = (level: LevelShape, s: FlowState): PatternId[] => level.sockets.flatMap((k) => (s.plugs[k.id] ? [s.plugs[k.id].pattern] : []))

export const pendingSockets = (level: LevelShape, s: FlowState): SocketDef[] => level.sockets.filter((k) => s.plugs[k.id]?.outcome !== 'solves')

// La opción enchufada más recientemente: la que comenta la nota de campo.
export function lastPluggedOption(level: LevelShape, s: FlowState): SocketOption | undefined {
  const p = s.last ? s.plugs[s.last] : undefined
  return p ? level.sockets.find((k) => k.id === p.socketId)?.options[p.pattern] : undefined
}

// Qué circuito corre en cada momento del flujo.
export function variantFor(level: LevelShape, s: FlowState, repairs: string[]): Variant {
  const sockets = level.sockets.flatMap((k) => (s.plugs[k.id] ? [{ id: k.id, pattern: s.plugs[k.id].pattern }] : []))
  const plugged: Variant = sockets.length ? { sockets } : {}
  const ticket = level.changeTickets[0]?.id
  const base: Variant = repairs.length ? { repairs } : {}
  switch (s.stage) {
    case 'observe':
      return base
    case 'choose':
      return { ...base, ...plugged }
    case 'change':
      return { ...base, ...plugged, ...(s.ticketApplied && ticket ? { ticket } : {}) }
    case 'compare':
    case 'complete': {
      const withTicket = ticket ? { ticket } : {}
      return s.side === 'with' ? { ...base, ...plugged, ...withTicket } : { ...base, ...withTicket }
    }
  }
}
