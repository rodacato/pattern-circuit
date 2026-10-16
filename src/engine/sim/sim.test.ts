import { describe, expect, it } from 'vitest'
import { Circuit, Scenario } from '../schema'
import { line, scenario } from '../testing'
import { createSim, runToEnd } from './sim'

describe('simulation', () => {
  it('delivers pulses through a linear circuit', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } })
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 }, { at: 10 })))
    expect(sim.state.metrics).toMatchObject({ spawned: 2, delivered: 2, dropped: 0 })
    expect(sim.state.pulses[0].trail).toEqual(['src', 'a', 'out'])
  })

  it('drops the pulse when the output wire is missing', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' } })
    const { events } = runToEnd(createSim(c, scenario({ at: 0 })))
    expect(events.find((e) => e.type === 'pulse.drop')).toMatchObject({ nodeId: 'a', reason: 'no-wire' })
  })

  it('a branch with no case for the tag falls to else', () => {
    const c = line({ src: { type: 'source' }, b: { type: 'branch', cases: { x: 'out' }, else: 'drop' }, out: { type: 'sink' } })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0, tags: ['x'] }, { at: 5, tags: ['y'] })))
    expect(sim.state.metrics).toMatchObject({ delivered: 1, dropped: 1 })
    expect(events.filter((e) => e.type === 'pulse.branch').map((e) => e.branch)).toEqual(['x', 'else'])
  })

  it('transform with `when` only changes the pulses that meet the condition', () => {
    const c = line({
      src: { type: 'source' },
      fix: { type: 'transform', when: { hasTag: 'bad' }, removeTags: ['bad'], addTags: ['fixed'] },
      out: { type: 'sink' },
    })
    const { sim } = runToEnd(createSim(c, scenario({ at: 0, tags: ['bad'] }, { at: 5, tags: ['ok'] })))
    expect(sim.state.pulses.map((p) => p.tags)).toEqual([['fixed'], ['ok']])
  })

  it('broadcast clones the pulse and the sink counts duplicates by origin', () => {
    const c = Circuit.parse({
      nodes: [
        { id: 'src', label: '', at: [0, 0], behavior: { type: 'source' } },
        { id: 'bc', label: '', at: [2, 0], behavior: { type: 'broadcast' } },
        { id: 'a', label: '', at: [4, 0], behavior: { type: 'pass' } },
        { id: 'b', label: '', at: [4, 2], behavior: { type: 'pass' } },
        { id: 'out', label: '', at: [6, 0], behavior: { type: 'sink' } },
      ],
      wires: [
        { from: 'src', to: 'bc' },
        { from: 'bc', to: 'a' },
        { from: 'bc', to: 'b' },
        { from: 'a', to: 'out' },
        { from: 'b', to: 'out' },
      ],
    })
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 })))
    expect(sim.state.metrics).toMatchObject({ spawned: 1, delivered: 2, duplicatesAtSink: 1 })
  })

  it('a node with capacity queues and records the peak load', () => {
    const c = line({ src: { type: 'source' }, slow: { type: 'pass' }, out: { type: 'sink' } }, { slow: { capacity: 1, cost: 40 } })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0 }, { at: 0 }, { at: 0 })))
    expect(sim.state.metrics).toMatchObject({ delivered: 3, maxLoad: 3 })
    expect(events.filter((e) => e.type === 'pulse.queue')).toHaveLength(2)
  })

  it('is deterministic: same input, same events', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } }, { a: { capacity: 1 } })
    const s = scenario({ at: 0 }, { at: 3 }, { at: 7 })
    expect(runToEnd(createSim(c, s)).events).toEqual(runToEnd(createSim(c, s)).events)
  })
})

describe('primitives with memory', () => {
  const graph = (nodes: object[], wires: object[]) => Circuit.parse({ nodes, wires })
  const node = (id: string, x: number, behavior: object, y = 0) => ({ id, label: id, at: [x, y], behavior })

  it('counter: nodes with the same key share the numbering; fresh always starts at 1', () => {
    const run = (fresh: boolean) =>
      runToEnd(
        createSim(
          line({ src: { type: 'source' }, n: { type: 'counter', key: 'k', field: 'ticket', fresh }, out: { type: 'sink', uniqueBy: 'ticket' } }),
          scenario({ at: 0 }, { at: 5 }, { at: 10 }),
        ),
      ).sim.state
    const shared = run(false)
    expect(shared.pulses.map((p) => p.data.ticket)).toEqual([1, 2, 3])
    expect(shared.metrics.invalidAtSink).toBe(0)
    expect(run(true).metrics.invalidAtSink).toBe(2)
  })

  it('join: waits for one part per input wire and continues with a single pulse that gathers all of them', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('bc', 2, { type: 'broadcast' }), node('a', 4, { type: 'transform', addTags: ['de-a'] }, -1), node('b', 4, { type: 'transform', addTags: ['de-b'] }, 1), node('j', 6, { type: 'join' }), node('out', 8, { type: 'sink' })],
      [{ from: 'src', to: 'bc' }, { from: 'bc', to: 'a' }, { from: 'bc', to: 'b' }, { from: 'a', to: 'j' }, { from: 'b', to: 'j' }, { from: 'j', to: 'out' }],
    )
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 })))
    expect(sim.state.metrics).toMatchObject({ delivered: 1, duplicatesAtSink: 0 })
    expect(sim.state.pulses.filter((p) => p.status === 'merged')).toHaveLength(1)
    expect(sim.state.pulses.find((p) => p.status === 'delivered')?.tags.sort()).toEqual(['de-a', 'de-b'])
  })

  it('join: if a part is lost, the rest stay held without hanging the simulation', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('bc', 2, { type: 'broadcast' }), node('a', 4, { type: 'pass' }, -1), node('b', 4, { type: 'branch', cases: {} }, 1), node('j', 6, { type: 'join' }), node('out', 8, { type: 'sink' })],
      [{ from: 'src', to: 'bc' }, { from: 'bc', to: 'a' }, { from: 'bc', to: 'b' }, { from: 'a', to: 'j' }, { from: 'b', to: 'j' }, { from: 'j', to: 'out' }],
    )
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 })))
    expect(sim.state.metrics).toMatchObject({ delivered: 0, dropped: 1 })
  })

  it('cache: the first time leaves through miss and the next ones through hit', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('c', 2, { type: 'cache', key: 'item' }), node('slow', 4, { type: 'pass' }, 1), node('out', 6, { type: 'sink' })],
      [{ from: 'src', to: 'c' }, { from: 'c', port: 'miss', to: 'slow' }, { from: 'c', port: 'hit', to: 'out' }, { from: 'slow', to: 'out' }],
    )
    const s = Scenario.parse({ id: 's', pulses: ['cafe', 'cafe', 'leche'].map((item, i) => ({ at: i * 10, from: 'src', data: { item } })) })
    const { sim, events } = runToEnd(createSim(c, s))
    expect(events.filter((e) => e.type === 'pulse.cache').map((e) => e.hit)).toEqual([false, true, false])
    expect(sim.state.pulses.map((p) => p.trail.includes('slow'))).toEqual([true, false, true])
  })

  it('machine: remembers the state between pulses and rejects what does not apply', () => {
    const c = line({
      src: { type: 'source' },
      m: {
        type: 'machine',
        initial: 'pendiente',
        states: { pendiente: { pagar: { to: 'pagado', port: 'out' } }, pagado: { entregar: { to: 'entregado', port: 'out' } } },
        else: 'drop',
      },
      out: { type: 'sink' },
    })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0, tags: ['entregar'] }, { at: 30, tags: ['pagar'] }, { at: 60, tags: ['entregar'] })))
    expect(sim.state.metrics).toMatchObject({ delivered: 2, dropped: 1 })
    expect(sim.state.nodeState.m).toBe('entregado')
    expect(events.filter((e) => e.type === 'node.state').map((e) => e.state)).toEqual(['pagado', 'entregado'])
  })

  it('buffer: cancelling cancels the held order of the same request', () => {
    const c = line({ src: { type: 'source' }, q: { type: 'buffer', cancelTag: 'cancelar', match: 'order' }, out: { type: 'sink' } }, { q: { cost: 60 } })
    const s = Scenario.parse({
      id: 's',
      pulses: [
        { at: 0, from: 'src', data: { order: 1 } },
        { at: 5, from: 'src', data: { order: 2 } },
        { at: 20, from: 'src', tags: ['cancelar'], data: { order: 1 } },
      ],
    })
    const { sim } = runToEnd(createSim(c, s))
    expect(sim.state.metrics).toMatchObject({ delivered: 1, cancelled: 1, dropped: 0 })
    expect(sim.state.pulses.map((p) => p.status)).toEqual(['cancelled', 'delivered', 'cancelled'])
  })

  it('breaker: after the failure threshold it opens and diverts everything to the fallback', () => {
    const c = Circuit.parse({
      nodes: [
        node('src', 0, { type: 'source' }),
        node('b', 2, { type: 'breaker', threshold: 2, failTag: 'fallo' }),
        node('svc', 4, { type: 'guard', require: { hasTag: 'nunca' }, onFail: 'fallo' }),
        node('mark', 3, { type: 'transform', addTags: ['fallo'] }, 2),
        node('backup', 6, { type: 'sink' }, 2),
      ],
      wires: [
        { from: 'src', to: 'b' },
        { from: 'b', port: 'call', to: 'svc' },
        { from: 'svc', port: 'fallo', to: 'mark' },
        { from: 'mark', to: 'b' },
        { from: 'b', port: 'fallback', to: 'backup' },
      ],
    })
    const s = Scenario.parse({ id: 's', pulses: [0, 150, 300, 450].map((at) => ({ at, from: 'src' })) })
    const { sim } = runToEnd(createSim(c, s))
    expect(sim.state.metrics).toMatchObject({ delivered: 4, dropped: 0 })
    expect(sim.state.nodeState.b).toBe('open')
    expect(sim.state.pulses.map((p) => p.trail.includes('svc'))).toEqual([true, true, false, false])
  })
})
