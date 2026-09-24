import { applyPatch, nodesTouched } from '../circuit/patch'
import type { Assertion, Circuit, LevelDef, MetricName, PatternId, Scenario, SocketDef, SocketOption } from '../schema'
import { createSim, runToEnd, type SimConfig } from '../sim/sim'

export type Plug = { id: string; pattern: PatternId }

// Una variante es una combinación de decisiones del jugador sobre el circuito base.
export type Variant = {
  repairs?: string[]
  socket?: Plug // atajo para niveles de un solo socket
  sockets?: Plug[]
  ticket?: string
}

export const plugsOf = (v: Variant): Plug[] => v.sockets ?? (v.socket ? [v.socket] : [])

// Opciones enchufadas en el orden en que el nivel declara sus sockets.
export function pluggedOptions(level: LevelDef, v: Variant): { socket: SocketDef; option: SocketOption }[] {
  const plugs = plugsOf(v)
  for (const p of plugs) {
    if (!level.sockets.some((s) => s.id === p.id)) throw new Error(`${level.id}: socket inexistente ${p.id}`)
  }
  return level.sockets.flatMap((socket) => {
    const plug = plugs.find((p) => p.id === socket.id)
    const option = plug && socket.options[plug.pattern]
    if (plug && !option) throw new Error(`${level.id}: ${plug.pattern} no es opción de ${socket.id}`)
    return option ? [{ socket, option }] : []
  })
}

export const socketOption = (level: LevelDef, v: Variant): SocketOption | undefined => pluggedOptions(level, v)[0]?.option

// Un ticket se aplica "a la manera correcta" solo con todos los sockets resueltos.
export const solvesAll = (level: LevelDef, v: Variant) => {
  const plugged = pluggedOptions(level, v)
  return plugged.length === level.sockets.length && plugged.every((p) => p.option.outcome === 'solves')
}

function beforeTicket(level: LevelDef, v: Variant): Circuit {
  let c = level.circuit
  for (const id of v.repairs ?? []) {
    const repair = level.repairs.find((r) => r.id === id)
    if (!repair) throw new Error(`${level.id}: reparación inexistente ${id}`)
    c = applyPatch(c, repair.patch)
  }
  for (const { option } of pluggedOptions(level, v)) c = applyPatch(c, option.patch)
  return c
}

export function buildCircuit(level: LevelDef, v: Variant): { circuit: Circuit; touched: string[] } {
  const before = beforeTicket(level, v)
  if (!v.ticket) return { circuit: before, touched: [] }
  const ticket = level.changeTickets.find((t) => t.id === v.ticket)
  if (!ticket) throw new Error(`${level.id}: ticket inexistente ${v.ticket}`)
  const plugged = plugsOf(v).length > 0
  if (plugged && !solvesAll(level, v)) throw new Error(`${level.id}: el ticket ${ticket.id} requiere una solución`)
  const after = applyPatch(before, plugged ? ticket.with : ticket.without)
  return { circuit: after, touched: nodesTouched(before, after) }
}

export function scenarioFor(level: LevelDef, v: Variant): Scenario {
  const id = v.ticket ? level.changeTickets.find((t) => t.id === v.ticket)?.scenario : level.scenarios[0].id
  const scenario = level.scenarios.find((s) => s.id === id)
  if (!scenario) throw new Error(`${level.id}: escenario inexistente ${id}`)
  return scenario
}

// Con varios sockets el código se compone: 'base' + el fragmento de cada socket (vacío o enchufado).
export function codeKey(level: LevelDef, v: Variant): string {
  const plugged = pluggedOptions(level, v)
  const ticket = level.changeTickets.find((t) => t.id === v.ticket)
  const ticketCode = plugged.length ? ticket?.code.with : ticket?.code.without
  if (ticketCode) return ticketCode
  if (level.sockets.length > 1) {
    const parts = level.sockets.map((s) => plugged.find((p) => p.socket.id === s.id)?.option.code ?? s.code)
    return ['base', ...parts.filter((k): k is string => !!k)].join('+')
  }
  if (plugged[0]) return plugged[0].option.code
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
