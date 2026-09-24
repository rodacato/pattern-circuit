import { describe, expect, it } from 'vitest'
import { line } from '../testing'
import { applyPatch, nodesTouched } from './patch'

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
