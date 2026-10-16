import { describe, expect, it } from 'vitest'
import { line } from '../testing'
import { applyPatch, circuitErrors, nodesTouched, wireId } from './patch'

describe('patches and change cost', () => {
  const base = line({ src: { type: 'source' }, hub: { type: 'slot' }, out: { type: 'sink' } })

  it('registering an abstract wire in a slot touches no existing nodes', () => {
    const after = applyPatch(base, {
      add: {
        nodes: [{ id: 'x', label: '', kind: 'class', at: [2, 2], behavior: { type: 'pass' } }],
        wires: [{ from: 'hub', to: 'x', key: 'x', dep: 'abstract', port: 'out' }],
      },
    })
    expect(nodesTouched(base, after)).toEqual([])
  })

  it('changing the behavior or a concrete dependency does count', () => {
    const changed = applyPatch(base, { update: [{ id: 'hub', behavior: { type: 'pass' } }] })
    expect(nodesTouched(base, changed)).toEqual(['hub'])
    const rewired = applyPatch(base, { removeWires: ['hub->out'] })
    expect(nodesTouched(base, rewired)).toEqual(['hub'])
  })
})

describe('patches: edge cases', () => {
  const base = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } })

  it('removing a node takes its wires with it', () => {
    const after = applyPatch(base, { remove: ['a'] })
    expect(after.wires).toEqual([])
    expect(nodesTouched(base, after)).toEqual(['src', 'a'])
  })

  it('removing a wire by id leaves the nodes intact', () => {
    expect(applyPatch(base, { removeWires: ['a->out'] }).wires.map(wireId)).toEqual(['src->a'])
  })

  it('circuitErrors detects duplicates and nonexistent endpoints', () => {
    const broken = { nodes: [...base.nodes, base.nodes[0]], wires: [...base.wires, base.wires[0], { ...base.wires[0], to: 'nadie' }] }
    expect(circuitErrors(broken)).toEqual(['nodo duplicado: src', 'cable duplicado: src->a', 'cable src->nadie: destino inexistente nadie'])
  })
})
