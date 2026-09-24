import { compile, type CompiledCircuit, type CompiledWire } from '../circuit/compile'
import { matches } from './predicate'
import type { Circuit, NodeDef, Scenario, ScenarioPulse } from '../schema'
import type { DropReason, Pulse, SimEvent, SimState } from './types'

export type SimConfig = {
  speed: number // celdas por tick
  defaultCost: number // ticks dentro de un nodo
}

export const DEFAULT_CONFIG: SimConfig = { speed: 0.1, defaultCost: 18 }

export type Sim = {
  circuit: CompiledCircuit
  schedule: ScenarioPulse[]
  config: SimConfig
  state: SimState
}

export function createSim(circuit: Circuit, scenario: Scenario, config: Partial<SimConfig> = {}): Sim {
  const compiled = compile(circuit)
  const schedule = scenario.pulses
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.at - b.p.at || a.i - b.i)
    .map(({ p }) => p)
  for (const p of schedule) {
    if (!compiled.nodes.has(p.from)) throw new Error(`Escenario ${scenario.id}: nodo inexistente ${p.from}`)
  }
  return {
    circuit: compiled,
    schedule,
    config: { ...DEFAULT_CONFIG, ...config },
    state: {
      tick: 0,
      nextPulseId: 1,
      scenarioCursor: 0,
      pulses: [],
      load: Object.fromEntries(circuit.nodes.map((n) => [n.id, 0])),
      queues: Object.fromEntries(circuit.nodes.map((n) => [n.id, []])),
      deliveredOrigins: {},
      counters: {},
      nodeState: {},
      cacheKeys: {},
      joins: {},
      sinkSeen: {},
      metrics: { spawned: 0, delivered: 0, dropped: 0, invalidAtSink: 0, duplicatesAtSink: 0, cancelled: 0, maxLoad: 0 },
    },
  }
}

// Un pulso retenido en un join cuyos hermanos se perdieron ya no avanzará: no bloquea el final.
export function isDone(sim: Sim): boolean {
  return sim.state.scenarioCursor >= sim.schedule.length && sim.state.pulses.every((p) => p.status !== 'alive' || p.loc.kind === 'held')
}

// Paso puro: devuelve un Sim nuevo; el estado anterior queda intacto para la línea de tiempo.
export function step(sim: Sim): { sim: Sim; events: SimEvent[] } {
  const s: SimState = structuredClone(sim.state)
  const run = new Tick(sim, s)
  run.spawnScheduled()
  run.advanceAll()
  s.tick += 1
  return { sim: { ...sim, state: s }, events: run.events }
}

export function runToEnd(sim: Sim, maxTicks = 20_000): { sim: Sim; events: SimEvent[] } {
  const events: SimEvent[] = []
  let current = sim
  while (!isDone(current)) {
    if (current.state.tick >= maxTicks) throw new Error(`La simulación no terminó en ${maxTicks} ticks`)
    const r = step(current)
    current = r.sim
    events.push(...r.events)
  }
  return { sim: current, events }
}

class Tick {
  readonly events: SimEvent[] = []
  private readonly c: CompiledCircuit
  private readonly s: SimState
  private readonly sim: Sim

  constructor(sim: Sim, state: SimState) {
    this.sim = sim
    this.c = sim.circuit
    this.s = state
  }

  spawnScheduled() {
    const { schedule } = this.sim
    while (this.s.scenarioCursor < schedule.length && schedule[this.s.scenarioCursor].at <= this.s.tick) {
      const def = schedule[this.s.scenarioCursor++]
      const id = this.s.nextPulseId++
      const pulse: Pulse = {
        id,
        originId: id,
        label: def.label,
        shape: def.shape,
        tags: [...def.tags],
        data: structuredClone(def.data),
        loc: { kind: 'gone', nodeId: def.from },
        status: 'alive',
        trail: [],
      }
      this.s.pulses.push(pulse)
      this.s.metrics.spawned++
      this.emit({ type: 'pulse.spawn', pulseId: id, nodeId: def.from })
      this.arrive(pulse, def.from)
    }
  }

  advanceAll() {
    // Solo los pulsos que existían al inicio del tick; los clones empiezan a moverse en el siguiente.
    const count = this.s.pulses.length
    for (let i = 0; i < count; i++) {
      const pulse = this.s.pulses[i]
      if (pulse.status !== 'alive') continue
      const loc = pulse.loc
      if (loc.kind === 'wire') this.moveAlongWire(pulse, loc)
      else if (loc.kind === 'node') {
        if (loc.remaining > 0) loc.remaining--
        if (loc.remaining === 0) this.resolve(pulse, this.c.nodes.get(loc.nodeId)!)
      }
    }
  }

  private moveAlongWire(pulse: Pulse, loc: { wireId: string; progress: number }) {
    const wire = this.c.wires.get(loc.wireId)!
    loc.progress = wire.length === 0 ? 1 : Math.min(1, loc.progress + this.sim.config.speed / wire.length)
    if (loc.progress >= 1) this.arrive(pulse, wire.to)
  }

  private arrive(pulse: Pulse, nodeId: string) {
    const node = this.c.nodes.get(nodeId)!
    pulse.trail.push(nodeId)
    this.setLoad(nodeId, this.s.load[nodeId] + 1)
    const processing = this.s.load[nodeId] - this.s.queues[nodeId].length - 1
    if (node.capacity !== undefined && processing >= node.capacity) {
      pulse.loc = { kind: 'queued', nodeId }
      this.s.queues[nodeId].push(pulse.id)
      this.emit({ type: 'pulse.queue', pulseId: pulse.id, nodeId })
      return
    }
    this.startProcessing(pulse, node)
    if (node.behavior.type === 'buffer') this.tryCancel(pulse, node, node.behavior)
  }

  private startProcessing(pulse: Pulse, node: NodeDef) {
    const cost = node.cost ?? (node.behavior.type === 'source' ? 0 : this.sim.config.defaultCost)
    pulse.loc = { kind: 'node', nodeId: node.id, remaining: cost }
    this.emit({ type: 'pulse.enter', pulseId: pulse.id, nodeId: node.id, codeRef: node.codeRef })
  }

  private resolve(pulse: Pulse, node: NodeDef) {
    const b = node.behavior
    switch (b.type) {
      case 'source':
      case 'pass':
        return this.exitVia(pulse, node, 'out')
      case 'sink':
        return this.deliver(pulse, node, (b.expects ? matches(b.expects, pulse) : true) && this.firstSeen(node, b.uniqueBy, pulse))
      case 'transform':
        if (b.when && !matches(b.when, pulse)) return this.exitVia(pulse, node, 'out')
        if (b.addTags) pulse.tags = [...new Set([...pulse.tags, ...b.addTags])]
        if (b.removeTags) pulse.tags = pulse.tags.filter((t) => !b.removeTags!.includes(t))
        if (b.setShape) pulse.shape = b.setShape
        if (b.setData) pulse.data = { ...pulse.data, ...structuredClone(b.setData) }
        this.emit({ type: 'pulse.transform', pulseId: pulse.id, nodeId: node.id })
        return this.exitVia(pulse, node, 'out')
      case 'branch': {
        const tag = Object.keys(b.cases).find((t) => pulse.tags.includes(t))
        this.emitBranch(pulse, node, tag ?? 'else')
        if (tag) return this.exitVia(pulse, node, b.cases[tag])
        return b.else === 'drop' ? this.drop(pulse, node, 'unhandled') : this.exitVia(pulse, node, b.else)
      }
      case 'slot': {
        const wire = this.c.outgoing.get(node.id)!.find((w) => w.key !== undefined && pulse.tags.includes(w.key))
        this.emitBranch(pulse, node, wire?.key ?? 'else')
        return wire ? this.leaveOn(pulse, node, wire) : this.drop(pulse, node, 'unhandled')
      }
      case 'broadcast': {
        const [first, ...rest] = this.c.outgoing.get(node.id)!
        if (!first) return this.drop(pulse, node, 'no-wire')
        for (const wire of rest) this.leaveOn(this.clone(pulse, node), node, wire, false)
        return this.leaveOn(pulse, node, first)
      }
      case 'guard':
        if (matches(b.require, pulse)) return this.exitVia(pulse, node, 'out')
        return b.onFail === 'drop' ? this.drop(pulse, node, 'guard') : this.exitVia(pulse, node, b.onFail)
      case 'counter': {
        const value = b.fresh ? 1 : (this.s.counters[b.key] ?? 0) + 1
        if (!b.fresh) this.s.counters[b.key] = value
        pulse.data = { ...pulse.data, [b.field]: value }
        this.emit({ type: 'pulse.count', pulseId: pulse.id, nodeId: node.id, value })
        return this.exitVia(pulse, node, 'out')
      }
      case 'join':
        return this.join(pulse, node)
      case 'cache': {
        const key = String(pulse.data[b.key])
        const seen = (this.s.cacheKeys[node.id] ??= [])
        const hit = seen.includes(key)
        if (!hit) seen.push(key)
        this.emit({ type: 'pulse.cache', pulseId: pulse.id, nodeId: node.id, hit })
        return this.exitVia(pulse, node, hit ? 'hit' : 'miss')
      }
      case 'machine': {
        const current = this.s.nodeState[node.id] ?? b.initial
        const transitions = b.states[current] ?? {}
        const tag = Object.keys(transitions).find((t) => pulse.tags.includes(t))
        this.emitBranch(pulse, node, current)
        if (!tag) return b.else === 'drop' ? this.drop(pulse, node, 'unhandled') : this.exitVia(pulse, node, b.else)
        const t = transitions[tag]
        if (t.addTags) pulse.tags = [...new Set([...pulse.tags, ...t.addTags])]
        if (t.to && t.to !== current) {
          this.s.nodeState[node.id] = t.to
          this.emit({ type: 'node.state', nodeId: node.id, state: t.to })
        }
        return this.exitVia(pulse, node, t.port)
      }
      case 'buffer':
        return this.exitVia(pulse, node, pulse.tags.includes(b.cancelTag) ? 'orphan' : 'out')
    }
  }

  private join(pulse: Pulse, node: NodeDef) {
    const expected = [...this.c.wires.values()].filter((w) => w.to === node.id).length
    const byOrigin = (this.s.joins[node.id] ??= {})
    const held = (byOrigin[pulse.originId] ??= [])
    if (held.length + 1 < expected) {
      held.push(pulse.id)
      pulse.loc = { kind: 'held', nodeId: node.id }
      this.release(node)
      return
    }
    for (const id of held) {
      const sibling = this.s.pulses.find((p) => p.id === id)!
      sibling.status = 'merged'
      sibling.loc = { kind: 'gone', nodeId: node.id }
      this.emit({ type: 'pulse.merge', pulseId: id, nodeId: node.id, intoId: pulse.id })
    }
    delete byOrigin[pulse.originId]
    return this.exitVia(pulse, node, 'out')
  }

  // Deshacer: la orden de cancelar anula a la orden retenida que apunta al mismo pedido.
  private tryCancel(pulse: Pulse, node: NodeDef, b: { cancelTag: string; match: string }) {
    if (!pulse.tags.includes(b.cancelTag)) return
    const target = this.s.pulses.find(
      (p) =>
        p.status === 'alive' &&
        p.id !== pulse.id &&
        (p.loc.kind === 'node' || p.loc.kind === 'queued') &&
        p.loc.nodeId === node.id &&
        !p.tags.includes(b.cancelTag) &&
        p.data[b.match] === pulse.data[b.match],
    )
    if (!target) return
    for (const p of [target, pulse]) {
      const wasQueued = p.loc.kind === 'queued'
      if (wasQueued) this.s.queues[node.id] = this.s.queues[node.id].filter((id) => id !== p.id)
      p.status = 'cancelled'
      p.loc = { kind: 'gone', nodeId: node.id }
      this.emit({ type: 'pulse.cancel', pulseId: p.id, nodeId: node.id, byId: pulse.id })
      if (wasQueued) this.setLoad(node.id, this.s.load[node.id] - 1)
      else this.release(node)
    }
    this.s.metrics.cancelled++
  }

  private firstSeen(node: NodeDef, field: string | undefined, pulse: Pulse): boolean {
    if (!field) return true
    const value = String(pulse.data[field])
    const seen = (this.s.sinkSeen[node.id] ??= [])
    if (seen.includes(value)) return false
    seen.push(value)
    return true
  }

  private exitVia(pulse: Pulse, node: NodeDef, port: string) {
    const wire = this.c.outgoing.get(node.id)!.find((w) => w.port === port)
    return wire ? this.leaveOn(pulse, node, wire) : this.drop(pulse, node, 'no-wire')
  }

  private leaveOn(pulse: Pulse, node: NodeDef, wire: CompiledWire, freesSlot = true) {
    pulse.loc = { kind: 'wire', wireId: wire.id, progress: 0 }
    this.emit({ type: 'pulse.exit', pulseId: pulse.id, nodeId: node.id, wireId: wire.id })
    if (freesSlot) this.release(node)
  }

  private clone(pulse: Pulse, node: NodeDef): Pulse {
    const id = this.s.nextPulseId++
    const copy: Pulse = { ...structuredClone(pulse), id }
    this.s.pulses.push(copy)
    this.emit({ type: 'pulse.clone', pulseId: id, fromId: pulse.id, nodeId: node.id })
    return copy
  }

  private deliver(pulse: Pulse, node: NodeDef, valid: boolean) {
    pulse.status = 'delivered'
    pulse.loc = { kind: 'gone', nodeId: node.id }
    const m = this.s.metrics
    m.delivered++
    if (!valid) m.invalidAtSink++
    const key = `${node.id}:${pulse.originId}`
    const prev = this.s.deliveredOrigins[key] ?? 0
    if (prev > 0) m.duplicatesAtSink++
    this.s.deliveredOrigins[key] = prev + 1
    this.emit({ type: 'pulse.deliver', pulseId: pulse.id, nodeId: node.id, valid })
    this.release(node)
  }

  private drop(pulse: Pulse, node: NodeDef, reason: DropReason) {
    pulse.status = 'dropped'
    pulse.loc = { kind: 'gone', nodeId: node.id }
    this.s.metrics.dropped++
    this.emit({ type: 'pulse.drop', pulseId: pulse.id, nodeId: node.id, reason })
    this.release(node)
  }

  private release(node: NodeDef) {
    this.setLoad(node.id, this.s.load[node.id] - 1)
    const nextId = this.s.queues[node.id].shift()
    if (nextId === undefined) return
    this.startProcessing(this.s.pulses.find((p) => p.id === nextId)!, node)
  }

  private emitBranch(pulse: Pulse, node: NodeDef, branch: string) {
    const codeRef = node.codeRef ? `${node.codeRef}:${branch}` : undefined
    this.emit({ type: 'pulse.branch', pulseId: pulse.id, nodeId: node.id, branch, codeRef })
  }

  private setLoad(nodeId: string, load: number) {
    this.s.load[nodeId] = load
    this.s.metrics.maxLoad = Math.max(this.s.metrics.maxLoad, load)
    this.emit({ type: 'node.load', nodeId, load })
  }

  private emit(e: DistributiveOmit<SimEvent, 'tick'>) {
    this.events.push({ ...e, tick: this.s.tick } as SimEvent)
  }
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never
