import { applyPatch, nodesTouched } from './patch'
import type { Assertion, Circuit, LevelDef, MetricName, PatternId, Scenario, SocketOption } from './schema'
import { createSim, runToEnd, type SimConfig } from './sim'

// Una variante es una combinación de decisiones del jugador sobre el circuito base.
export type Variant = {
  repairs?: string[]
  socket?: { id: string; pattern: PatternId }
  ticket?: string
}

export function socketOption(level: LevelDef, v: Variant): SocketOption | undefined {
  if (!v.socket) return undefined
  const socket = level.sockets.find((s) => s.id === v.socket!.id)
  if (!socket) throw new Error(`${level.id}: socket inexistente ${v.socket.id}`)
  return socket.options[v.socket.pattern]
}

function beforeTicket(level: LevelDef, v: Variant): Circuit {
  let c = level.circuit
  for (const id of v.repairs ?? []) {
    const repair = level.repairs.find((r) => r.id === id)
    if (!repair) throw new Error(`${level.id}: reparación inexistente ${id}`)
    c = applyPatch(c, repair.patch)
  }
  const option = socketOption(level, v)
  return option ? applyPatch(c, option.patch) : c
}

export function buildCircuit(level: LevelDef, v: Variant): { circuit: Circuit; touched: string[] } {
  const before = beforeTicket(level, v)
  if (!v.ticket) return { circuit: before, touched: [] }
  const ticket = level.changeTickets.find((t) => t.id === v.ticket)
  if (!ticket) throw new Error(`${level.id}: ticket inexistente ${v.ticket}`)
  const option = socketOption(level, v)
  if (option && option.outcome !== 'solves') throw new Error(`${level.id}: el ticket ${ticket.id} requiere una solución`)
  const after = applyPatch(before, option ? ticket.with : ticket.without)
  return { circuit: after, touched: nodesTouched(before, after) }
}

export function scenarioFor(level: LevelDef, v: Variant): Scenario {
  const id = v.ticket ? level.changeTickets.find((t) => t.id === v.ticket)?.scenario : level.scenarios[0].id
  const scenario = level.scenarios.find((s) => s.id === id)
  if (!scenario) throw new Error(`${level.id}: escenario inexistente ${id}`)
  return scenario
}

export function codeKey(level: LevelDef, v: Variant): string {
  const option = socketOption(level, v)
  const ticket = level.changeTickets.find((t) => t.id === v.ticket)
  const ticketCode = option ? ticket?.code.with : ticket?.code.without
  if (ticketCode) return ticketCode
  if (option) return option.code
  const repaired = [...(v.repairs ?? [])].reverse().map((id) => level.repairs.find((r) => r.id === id)?.code)
  return repaired.find((k) => k !== undefined) ?? 'base'
}

export type Evaluation = {
  metrics: Record<MetricName, number>
  touched: string[]
  results: { assertion: Assertion; actual: number; pass: boolean }[]
  won: boolean
}

export function evaluate(level: LevelDef, v: Variant, config?: Partial<SimConfig>): Evaluation {
  const { circuit, touched } = buildCircuit(level, v)
  const { sim } = runToEnd(createSim(circuit, scenarioFor(level, v), config))
  const metrics = { ...sim.state.metrics, nodesTouched: touched.length }
  const results = level.winWhen.map((assertion) => {
    const actual = metrics[assertion.metric]
    return { assertion, actual, pass: compare(actual, assertion.op, assertion.value) }
  })
  return { metrics, touched, results, won: results.every((r) => r.pass) }
}

function compare(a: number, op: Assertion['op'], b: number): boolean {
  if (op === '==') return a === b
  return op === '<=' ? a <= b : a >= b
}
