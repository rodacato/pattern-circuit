import type { LevelDef, PatternId, SocketOption, Variant } from '../../engine'

// observar el problema → elegir patrón → aplicar un cambio → comparar → completado.
// Las etapas que el nivel no necesita se saltan: sin sockets no hay "elegir", sin tickets no hay "cambio".
export type Stage = 'observe' | 'choose' | 'change' | 'compare' | 'complete'
export type Side = 'without' | 'with'
export type Plugged = { socketId: string; pattern: PatternId; outcome: SocketOption['outcome'] }

export type FlowState = {
  stage: Stage
  runs: number
  plugged?: Plugged
  solved: boolean // la última corrida con el patrón enchufado cumplió los objetivos
  ticketApplied: boolean
  ticketDone: boolean
  side: Side
}

export type FlowEvent =
  | { type: 'run-finished'; won: boolean }
  | { type: 'plug'; socketId: string; pattern: PatternId; outcome: SocketOption['outcome'] }
  | { type: 'unplug' }
  | { type: 'apply-ticket' }
  | { type: 'continue' }
  | { type: 'compare'; side: Side }
  | { type: 'finish' }

type LevelShape = Pick<LevelDef, 'sockets' | 'changeTickets'>

export const initialFlow = (): FlowState => ({ stage: 'observe', runs: 0, solved: false, ticketApplied: false, ticketDone: false, side: 'with' })

export function reduceFlow(level: LevelShape, s: FlowState, e: FlowEvent): FlowState {
  const hasSockets = level.sockets.length > 0
  switch (e.type) {
    case 'run-finished': {
      const next = { ...s, runs: s.runs + 1 }
      if (s.stage === 'observe') {
        if (hasSockets) return { ...next, stage: 'choose' }
        return e.won ? { ...next, stage: 'complete' } : next
      }
      if (s.stage === 'choose') return { ...next, solved: e.won && s.plugged?.outcome === 'solves' }
      if (s.stage === 'change' && s.ticketApplied) return { ...next, ticketDone: e.won }
      return next
    }
    case 'plug':
      if (s.stage !== 'choose') return s
      return { ...s, plugged: { socketId: e.socketId, pattern: e.pattern, outcome: e.outcome }, solved: false }
    case 'unplug':
      return s.stage === 'choose' ? { ...s, plugged: undefined, solved: false } : s
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

// Qué circuito corre en cada momento del flujo.
export function variantFor(level: LevelShape, s: FlowState, repairs: string[]): Variant {
  const socket = s.plugged ? { id: s.plugged.socketId, pattern: s.plugged.pattern } : undefined
  const ticket = level.changeTickets[0]?.id
  const base: Variant = repairs.length ? { repairs } : {}
  switch (s.stage) {
    case 'observe':
      return base
    case 'choose':
      return socket ? { ...base, socket } : base
    case 'change':
      return { ...base, socket, ...(s.ticketApplied && ticket ? { ticket } : {}) }
    case 'compare':
    case 'complete': {
      const withTicket = ticket ? { ticket } : {}
      return s.side === 'with' && socket ? { ...base, socket, ...withTicket } : { ...base, ...withTicket }
    }
  }
}
