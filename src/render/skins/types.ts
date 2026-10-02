import type { Graphics } from 'pixi.js'
import type { CompiledCircuit, NodeDef, Point, Pulse, SimEvent, SimState } from '../../engine'
import type { Effects } from '../fx'

export type DrawContext = { d: Graphics; gl: Graphics; time: number; circuit: CompiledCircuit; state: SimState }
export type EventContext = { fx: Effects; circuit: CompiledCircuit; pulse?: Pulse }

// Visual signature of a pattern. It applies to nodes that declare `skin` and to pulses that passed through them.
export interface Skin {
  drawNode?(ctx: DrawContext, node: NodeDef, at: Point): void
  onEvent?(ctx: EventContext, node: NodeDef, at: Point, event: SimEvent): void
  drawPulse?(ctx: DrawContext, pulse: Pulse, pos: Point, visited: NodeDef[]): void
}
