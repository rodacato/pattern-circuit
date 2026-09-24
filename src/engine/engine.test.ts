import { describe, expect, it } from 'vitest'
import {
  applyPatch,
  Circuit,
  createSim,
  nodesTouched,
  parseCode,
  resolveRegion,
  runToEnd,
  Scenario,
  Timeline,
  type Behavior,
} from '.'

const line = (behaviors: Record<string, Behavior>, extra: Partial<Record<string, { capacity?: number; cost?: number }>> = {}) => {
  const ids = Object.keys(behaviors)
  return Circuit.parse({
    nodes: ids.map((id, i) => ({ id, label: id, at: [i * 2, 0], behavior: behaviors[id], ...extra[id] })),
    wires: ids.slice(1).map((id, i) => ({ from: ids[i], to: id })),
  })
}

const scenario = (...pulses: { at: number; tags?: string[] }[]) =>
  Scenario.parse({ id: 's', pulses: pulses.map((p) => ({ from: 'src', ...p })) })

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

describe('línea de tiempo', () => {
  it('retroceder y avanzar reproduce exactamente el mismo estado', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } }, { a: { capacity: 1 } })
    const tl = new Timeline(createSim(c, scenario({ at: 0 }, { at: 4 })), 10)
    for (let i = 0; i < 47; i++) tl.forward()
    const at47 = structuredClone(tl.current.state)
    tl.seek(12)
    expect(tl.tick).toBe(12)
    tl.back()
    expect(tl.tick).toBe(11)
    for (let i = 0; i < 36; i++) tl.forward()
    expect(tl.current.state).toEqual(at47)
  })
})

describe('parches y coste de cambio', () => {
  const base = line({ src: { type: 'source' }, hub: { type: 'slot' }, out: { type: 'sink' } })

  it('registrar un cable abstracto en un slot no toca nodos existentes', () => {
    const after = applyPatch(base, {
      add: {
        nodes: [{ id: 'x', label: '', kind: 'class', at: [2, 2], behavior: { type: 'pass' } }],
        wires: [{ from: 'hub', to: 'x', key: 'x', dep: 'abstract', port: 'out' }],
      },
    })
    expect(nodesTouched(base, after)).toEqual([])
  })

  it('cambiar el comportamiento o una dependencia concreta sí cuenta', () => {
    const changed = applyPatch(base, { update: [{ id: 'hub', behavior: { type: 'pass' } }] })
    expect(nodesTouched(base, changed)).toEqual(['hub'])
    const rewired = applyPatch(base, { removeWires: ['hub->out'] })
    expect(nodesTouched(base, rewired)).toEqual(['hub'])
  })
})

describe('código con regiones', () => {
  it('quita los marcadores y resuelve regiones anidadas con caída a la región padre', () => {
    const file = parseCode(['def a', '  # region: A#a', '  if x', '    # region: A#a:x', '    y', '    # endregion', '  end', '  # endregion', 'end'].join('\n'))
    expect(file.text.split('\n')).toEqual(['def a', '  if x', '    y', '  end', 'end'])
    expect(file.regions['A#a']).toEqual({ start: 2, end: 4 })
    expect(resolveRegion(file, 'A#a:x')).toEqual({ start: 3, end: 3 })
    expect(resolveRegion(file, 'A#a:else')).toEqual({ start: 2, end: 4 })
  })

  it('rechaza regiones sin cerrar', () => {
    expect(() => parseCode('# region: X\nfoo')).toThrow(/sin cerrar/)
  })
})
