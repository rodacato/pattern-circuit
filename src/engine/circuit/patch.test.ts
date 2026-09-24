import { describe, expect, it } from 'vitest'
import { line } from '../testing'
import { applyPatch, circuitErrors, nodesTouched, wireId } from './patch'

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

describe('parches: casos borde', () => {
  const base = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } })

  it('quitar un nodo se lleva sus cables', () => {
    const after = applyPatch(base, { remove: ['a'] })
    expect(after.wires).toEqual([])
    expect(nodesTouched(base, after)).toEqual(['src', 'a'])
  })

  it('quitar un cable por id deja los nodos intactos', () => {
    expect(applyPatch(base, { removeWires: ['a->out'] }).wires.map(wireId)).toEqual(['src->a'])
  })

  it('circuitErrors detecta duplicados y extremos inexistentes', () => {
    const broken = { nodes: [...base.nodes, base.nodes[0]], wires: [...base.wires, base.wires[0], { ...base.wires[0], to: 'nadie' }] }
    expect(circuitErrors(broken)).toEqual(['nodo duplicado: src', 'cable duplicado: src->a', 'cable src->nadie: destino inexistente nadie'])
  })
})
