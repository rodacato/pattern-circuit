import { describe, expect, it } from 'vitest'
import { Circuit, type Predicate } from '../schema'
import { line, scenario } from '../testing'
import { matches } from './predicate'
import { createSim, initialNodeState, isDone, runToEnd } from './sim'
import type { Pulse } from './types'

const node = (id: string, x: number, behavior: object, y = 0, extra: object = {}) => ({ id, label: id, at: [x, y], behavior, ...extra })
const graph = (nodes: object[], wires: object[]) => Circuit.parse({ nodes, wires })

describe('primitivas sin memoria', () => {
  it('guard: deja pasar lo que cumple y pierde lo demás con motivo `guard`', () => {
    const c = line({ src: { type: 'source' }, g: { type: 'guard', require: { hasTag: 'ok' }, onFail: 'drop' }, out: { type: 'sink' } })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0, tags: ['ok'] }, { at: 5 })))
    expect(sim.state.metrics).toMatchObject({ delivered: 1, dropped: 1 })
    expect(events.find((e) => e.type === 'pulse.drop')).toMatchObject({ reason: 'guard' })
  })

  it('guard: con `onFail` desvía lo rechazado por ese puerto', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('g', 2, { type: 'guard', require: { hasTag: 'ok' }, onFail: 'no' }), node('si', 4, { type: 'sink' }), node('no', 4, { type: 'sink' }, 2)],
      [{ from: 'src', to: 'g' }, { from: 'g', to: 'si' }, { from: 'g', port: 'no', to: 'no' }],
    )
    const { sim } = runToEnd(createSim(c, scenario({ at: 0, tags: ['ok'] }, { at: 5 })))
    expect(sim.state.pulses.map((p) => p.trail.at(-1))).toEqual(['si', 'no'])
  })

  it('slot: enruta por la clave del cable y pierde lo que nadie registró', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('s', 2, { type: 'slot' }), node('a', 4, { type: 'sink' }), node('b', 4, { type: 'sink' }, 2)],
      [{ from: 'src', to: 's' }, { from: 's', to: 'a', key: 'a', dep: 'abstract' }, { from: 's', to: 'b', key: 'b', dep: 'abstract' }],
    )
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0, tags: ['b'] }, { at: 5, tags: ['a'] }, { at: 10, tags: ['z'] })))
    expect(sim.state.pulses.map((p) => p.trail.at(-1))).toEqual(['b', 'a', 's'])
    expect(events.find((e) => e.type === 'pulse.drop')).toMatchObject({ reason: 'unhandled' })
  })

  it('sink: `expects` cuenta pedidos equivocados y `uniqueBy` los repetidos', () => {
    const expects = line({ src: { type: 'source' }, out: { type: 'sink', expects: { hasTag: 'latte' } } })
    expect(runToEnd(createSim(expects, scenario({ at: 0, tags: ['latte'] }, { at: 5, tags: ['te'] }))).sim.state.metrics).toMatchObject({ delivered: 2, invalidAtSink: 1 })
    const unique = graph([node('src', 0, { type: 'source' }), node('out', 2, { type: 'sink', uniqueBy: 'n' })], [{ from: 'src', to: 'out' }])
    const pulses = [1, 1, 2].map((n, i) => ({ at: i * 5, from: 'src', data: { n } }))
    expect(runToEnd(createSim(unique, { id: 's', pulses: pulses.map((p) => ({ ...p, tags: [], shape: 'circle' as const })) })).sim.state.metrics.invalidAtSink).toBe(1)
  })
})

describe('primitivas con estado', () => {
  it('breaker: su cuenta de fallos no se mezcla con la de un counter', () => {
    const c = graph(
      [
        node('src', 0, { type: 'source' }),
        node('n', 1, { type: 'counter', key: 'breaker:b', field: 'k' }),
        node('b', 2, { type: 'breaker', threshold: 5, failTag: 'fallo' }),
        node('svc', 4, { type: 'transform', addTags: ['fallo'] }),
        node('backup', 6, { type: 'sink' }, 2),
      ],
      [{ from: 'src', to: 'n' }, { from: 'n', to: 'b' }, { from: 'b', port: 'call', to: 'svc' }, { from: 'svc', to: 'b' }, { from: 'b', port: 'fallback', to: 'backup' }],
    )
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 }, { at: 30 })))
    expect(sim.state.counters['breaker:b']).toBe(2)
    expect(sim.state.failures.b).toBe(2)
    expect(sim.state.nodeState.b).toBeUndefined()
  })

  it('buffer: una cancelación que esperaba en cola también anula su orden', () => {
    const c = graph(
      [node('src', 0, { type: 'source' }), node('buf', 2, { type: 'buffer', cancelTag: 'undo', match: 'order' }, 0, { capacity: 2, cost: 30 }), node('out', 4, { type: 'sink' }), node('orphan', 4, { type: 'sink' }, 2)],
      [{ from: 'src', to: 'buf' }, { from: 'buf', to: 'out' }, { from: 'buf', port: 'orphan', to: 'orphan' }],
    )
    const pulses = [
      { at: 0, tags: [], data: { order: 1 } },
      { at: 5, tags: [], data: { order: 2 } },
      { at: 6, tags: ['undo'], data: { order: 2 } }, // llega con el buffer lleno: espera en cola
    ]
    const { sim } = runToEnd(createSim(c, { id: 's', pulses: pulses.map((p) => ({ ...p, from: 'src', shape: 'circle' as const })) }))
    expect(sim.state.metrics).toMatchObject({ cancelled: 1, delivered: 1 })
  })

  it('estado inicial: la máquina arranca en `initial` y el interruptor cerrado', () => {
    expect(initialNodeState({ type: 'machine', initial: 'nuevo', states: {}, else: 'drop' })).toBe('nuevo')
    expect(initialNodeState({ type: 'breaker', threshold: 1, failTag: 'x' })).toBe('cerrado')
    expect(initialNodeState({ type: 'pass' })).toBeUndefined()
  })
})

describe('límites de la simulación', () => {
  it('rechaza escenarios que salen de un nodo inexistente', () => {
    const c = line({ src: { type: 'source' }, out: { type: 'sink' } })
    expect(() => createSim(c, { id: 's', pulses: [{ at: 0, from: 'nadie', tags: [], shape: 'circle', data: {} }] })).toThrow(/nadie/)
  })

  it('runToEnd corta un circuito que no termina', () => {
    const c = graph([node('src', 0, { type: 'source' }), node('a', 2, { type: 'pass' }), node('b', 4, { type: 'pass' }, 2)], [{ from: 'src', to: 'a' }, { from: 'a', to: 'b' }, { from: 'b', to: 'a' }])
    expect(() => runToEnd(createSim(c, scenario({ at: 0 })), 500)).toThrow(/500 ticks/)
  })

  it('un escenario vacío ya está terminado', () => {
    expect(isDone(createSim(line({ src: { type: 'source' } }), scenario()))).toBe(true)
  })
})

describe('predicados', () => {
  const pulse = { tags: ['a', 'b'], shape: 'square', data: { n: 1 } } as unknown as Pulse
  it.each<[Predicate, boolean]>([
    [{ hasTag: 'a' }, true],
    [{ shape: 'square' }, true],
    [{ field: 'n', eq: 1 }, true],
    [{ not: { hasTag: 'a' } }, false],
    [{ all: [{ hasTag: 'a' }, { hasTag: 'c' }] }, false],
    [{ any: [{ hasTag: 'c' }, { hasTag: 'b' }] }, true],
  ])('%j → %s', (p, expected) => expect(matches(p, pulse)).toBe(expected))
})
