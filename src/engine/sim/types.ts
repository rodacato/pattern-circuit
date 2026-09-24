// Estado de simulación: JSON plano, clonable, sin referencias al circuito.
import type { MetricName, PulseShape } from '../schema'

export type PulseLoc =
  | { kind: 'wire'; wireId: string; progress: number } // 0..1 a lo largo del cable
  | { kind: 'node'; nodeId: string; remaining: number } // procesándose
  | { kind: 'queued'; nodeId: string } // esperando capacidad
  | { kind: 'held'; nodeId: string } // retenido en un join esperando a sus hermanos
  | { kind: 'gone'; nodeId: string } // entregado o perdido

export type PulseStatus = 'alive' | 'delivered' | 'dropped' | 'merged' | 'cancelled'

export type Pulse = {
  id: number
  originId: number // los clones de un broadcast comparten origen
  label?: string
  shape: PulseShape
  tags: string[]
  data: Record<string, unknown>
  loc: PulseLoc
  status: PulseStatus
  trail: string[] // nodos visitados
}

export type DropReason = 'unhandled' | 'guard' | 'no-wire'

export type SimEvent =
  | { type: 'pulse.spawn'; tick: number; pulseId: number; nodeId: string }
  | { type: 'pulse.enter'; tick: number; pulseId: number; nodeId: string; codeRef?: string }
  | { type: 'pulse.branch'; tick: number; pulseId: number; nodeId: string; branch: string; codeRef?: string }
  | { type: 'pulse.exit'; tick: number; pulseId: number; nodeId: string; wireId: string }
  | { type: 'pulse.transform'; tick: number; pulseId: number; nodeId: string }
  | { type: 'pulse.clone'; tick: number; pulseId: number; fromId: number; nodeId: string }
  | { type: 'pulse.queue'; tick: number; pulseId: number; nodeId: string }
  | { type: 'pulse.drop'; tick: number; pulseId: number; nodeId: string; reason: DropReason }
  | { type: 'pulse.deliver'; tick: number; pulseId: number; nodeId: string; valid: boolean }
  | { type: 'pulse.merge'; tick: number; pulseId: number; nodeId: string; intoId: number }
  | { type: 'pulse.cancel'; tick: number; pulseId: number; nodeId: string; byId: number }
  | { type: 'pulse.count'; tick: number; pulseId: number; nodeId: string; value: number }
  | { type: 'pulse.cache'; tick: number; pulseId: number; nodeId: string; hit: boolean }
  | { type: 'node.state'; tick: number; nodeId: string; state: string }
  | { type: 'node.load'; tick: number; nodeId: string; load: number }

export type SimMetrics = Record<Exclude<MetricName, 'nodesTouched'>, number>

export type SimState = {
  tick: number
  nextPulseId: number
  scenarioCursor: number // siguiente pulso del escenario por emitir
  pulses: Pulse[]
  load: Record<string, number> // pulsos dentro o en cola por nodo
  queues: Record<string, number[]> // ids en espera, FIFO
  deliveredOrigins: Record<string, number> // `${sink}:${origen}` -> entregas
  counters: Record<string, number>
  nodeState: Record<string, string> // estado actual de cada máquina
  cacheKeys: Record<string, string[]>
  joins: Record<string, Record<number, number[]>> // join -> origen -> pulsos retenidos
  sinkSeen: Record<string, string[]> // valores vistos por sinks con uniqueBy
  metrics: SimMetrics
}
