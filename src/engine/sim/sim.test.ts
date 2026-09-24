import { describe, expect, it } from 'vitest'
import { Circuit } from '../schema'
import { line, scenario } from '../testing'
import { createSim, runToEnd } from './sim'

describe('simulación', () => {
  it('entrega pulsos por un circuito lineal', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } })
    const { sim } = runToEnd(createSim(c, scenario({ at: 0 }, { at: 10 })))
    expect(sim.state.metrics).toMatchObject({ spawned: 2, delivered: 2, dropped: 0 })
    expect(sim.state.pulses[0].trail).toEqual(['src', 'a', 'out'])
  })

  it('pierde el pulso cuando falta el cable de salida', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' } })
    const { events } = runToEnd(createSim(c, scenario({ at: 0 })))
    expect(events.find((e) => e.type === 'pulse.drop')).toMatchObject({ nodeId: 'a', reason: 'no-wire' })
  })

  it('un branch sin caso para la etiqueta cae en else', () => {
    const c = line({ src: { type: 'source' }, b: { type: 'branch', cases: { x: 'out' }, else: 'drop' }, out: { type: 'sink' } })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0, tags: ['x'] }, { at: 5, tags: ['y'] })))
    expect(sim.state.metrics).toMatchObject({ delivered: 1, dropped: 1 })
    expect(events.filter((e) => e.type === 'pulse.branch').map((e) => e.branch)).toEqual(['x', 'else'])
  })

  it('transform con `when` solo cambia los pulsos que cumplen la condición', () => {
    const c = line({
      src: { type: 'source' },
      fix: { type: 'transform', when: { hasTag: 'bad' }, removeTags: ['bad'], addTags: ['fixed'] },
      out: { type: 'sink' },
    })
    const { sim } = runToEnd(createSim(c, scenario({ at: 0, tags: ['bad'] }, { at: 5, tags: ['ok'] })))
    expect(sim.state.pulses.map((p) => p.tags)).toEqual([['fixed'], ['ok']])
  })

  it('broadcast clona el pulso y el sink cuenta duplicados por origen', () => {
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

  it('un nodo con capacidad encola y registra la carga máxima', () => {
    const c = line({ src: { type: 'source' }, slow: { type: 'pass' }, out: { type: 'sink' } }, { slow: { capacity: 1, cost: 40 } })
    const { sim, events } = runToEnd(createSim(c, scenario({ at: 0 }, { at: 0 }, { at: 0 })))
    expect(sim.state.metrics).toMatchObject({ delivered: 3, maxLoad: 3 })
    expect(events.filter((e) => e.type === 'pulse.queue')).toHaveLength(2)
  })

  it('es determinista: misma entrada, mismos eventos', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } }, { a: { capacity: 1 } })
    const s = scenario({ at: 0 }, { at: 3 }, { at: 7 })
    expect(runToEnd(createSim(c, s)).events).toEqual(runToEnd(createSim(c, s)).events)
  })
})
