// Simulation state: plain JSON, cloneable, with no references to the circuit.
import type { MetricName, PulseShape } from '../schema'

type PulseLoc =
  | { kind: 'wire'; wireId: string; progress: number } // 0..1 along the wire
  | { kind: 'node'; nodeId: string; remaining: number } // being processed
  | { kind: 'queued'; nodeId: string } // waiting for capacity
  | { kind: 'held'; nodeId: string } // held in a join waiting for its siblings
  | { kind: 'gone'; nodeId: string } // delivered or lost

type PulseStatus = 'alive' | 'delivered' | 'dropped' | 'merged' | 'cancelled'

export type Pulse = {
  id: number
  originId: number // clones of a broadcast share an origin
  label?: string
  shape: PulseShape
  tags: string[]
  data: Record<string, unknown>
  loc: PulseLoc
  status: PulseStatus
  trail: string[] // visited nodes
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

// Circuit metrics (touched nodes, pieces) do not come from the simulation: `score` adds them.
export type SimMetrics = Record<Exclude<MetricName, 'nodesTouched' | 'nodes'>, number>

export type SimState = {
  tick: number
  nextPulseId: number
  scenarioCursor: number // next scenario pulse to emit
  pulses: Pulse[]
  load: Record<string, number> // pulses inside or queued per node
  queues: Record<string, number[]> // waiting ids, FIFO
  deliveredOrigins: Record<string, number> // `${sink}:${origin}` -> deliveries
  counters: Record<string, number>
  nodeState: Record<string, string> // current state of each machine or breaker
  failures: Record<string, number> // consecutive failures per breaker
  cacheKeys: Record<string, string[]>
  joins: Record<string, Record<number, number[]>> // join -> origin -> held pulses
  sinkSeen: Record<string, string[]> // values seen by sinks with uniqueBy
  metrics: SimMetrics
}
