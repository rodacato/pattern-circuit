import { describe, expect, it } from 'vitest'
import { defineLevel, reachableVariants } from './define'
import { buildCircuit, codeKey, evaluate, solvesAll } from './variants'

const option = (outcome: 'solves' | 'misfit', code: string, tag: string) => ({
  outcome,
  code,
  note: { title: '', body: '' },
  patch: { update: [{ id: tag === 'a' ? 'a' : 'b', behavior: { type: 'transform' as const, addTags: [tag] } }] },
})

const level = defineLevel({
  id: 'dos-sockets',
  order: 0,
  chapter: 'x',
  title: '',
  brief: { problem: '', goal: '' },
  circuit: {
    nodes: [
      { id: 'src', label: '', at: [0, 0], behavior: { type: 'source' } },
      { id: 'a', label: '', at: [2, 0], behavior: { type: 'pass' } },
      { id: 'b', label: '', at: [4, 0], behavior: { type: 'pass' } },
      { id: 'out', label: '', at: [6, 0], behavior: { type: 'sink', expects: { all: [{ hasTag: 'a' }, { hasTag: 'b' }] } } },
    ],
    wires: [
      { from: 'src', to: 'a' },
      { from: 'a', to: 'b' },
      { from: 'b', to: 'out' },
    ],
  },
  sockets: [
    { id: 'sa', at: 'a', label: '', inventory: ['strategy', 'observer'], code: 'a_vacio', options: { strategy: option('solves', 'a_ok', 'a'), observer: option('misfit', 'a_mal', 'x') } },
    { id: 'sb', at: 'b', label: '', inventory: ['builder'], code: 'b_vacio', options: { builder: option('solves', 'b_ok', 'b') } },
  ],
  scenarios: [{ id: 'main', pulses: [{ at: 0, from: 'src' }] }],
  changeTickets: [{ id: 't', text: '', scenario: 'main', without: {}, with: {} }],
  winWhen: [{ metric: 'invalidAtSink', op: '==', value: 0 }],
  code: { rb: { base: '# base', a_vacio: '# a?', a_ok: '# a!', a_mal: '# a×', b_vacio: '# b?', b_ok: '# b!' } },
})

const both = { sockets: [{ id: 'sa', pattern: 'strategy' as const }, { id: 'sb', pattern: 'builder' as const }] }

describe('niveles con varios sockets', () => {
  it('aplica el parche de cada socket enchufado', () => {
    const nodes = buildCircuit(level, both).circuit.nodes
    expect(nodes.find((n) => n.id === 'a')?.behavior).toMatchObject({ addTags: ['a'] })
    expect(nodes.find((n) => n.id === 'b')?.behavior).toMatchObject({ addTags: ['b'] })
  })

  it('solo gana con todos los sockets resueltos', () => {
    expect(evaluate(level, { sockets: [both.sockets[0]] }).won).toBe(false)
    expect(evaluate(level, both).won).toBe(true)
    expect(solvesAll(level, both)).toBe(true)
  })

  it('compone el código con la base y un fragmento por socket', () => {
    expect(codeKey(level, {})).toBe('base+a_vacio+b_vacio')
    expect(codeKey(level, both)).toBe('base+a_ok+b_ok')
    expect(level.codeFiles['base+a_mal+b_vacio'].text).toBe('# base\n# a×\n# b?')
  })

  it('las variantes cubren todas las combinaciones y el ticket solo sobre base o solución completa', () => {
    const variants = reachableVariants(level)
    expect(variants.filter((v) => !v.ticket)).toHaveLength(3 * 2)
    expect(variants.filter((v) => v.ticket).map((v) => v.sockets?.length ?? 0)).toEqual([0, 2])
  })
})
