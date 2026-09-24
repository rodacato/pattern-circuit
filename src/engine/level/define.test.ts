import { describe, expect, it } from 'vitest'
import type { LevelInput } from '../schema'
import { defineLevel, reachableVariants } from './define'
import { codeKey } from './variants'

// Nivel mínimo válido: src → a → out, con una reparación, un socket y un ticket.
const input = (overrides: Partial<LevelInput> = {}): LevelInput => ({
  id: 'mini',
  order: 0,
  chapter: 'x',
  title: '',
  brief: { problem: '', goal: '' },
  circuit: {
    nodes: [
      { id: 'src', label: '', at: [0, 0], behavior: { type: 'source' } },
      { id: 'a', label: '', at: [2, 0], behavior: { type: 'pass' }, codeRef: 'A#run' },
      { id: 'out', label: '', at: [4, 0], behavior: { type: 'sink' } },
    ],
    wires: [{ from: 'src', to: 'a' }],
  },
  repairs: [{ id: 'r', prompt: '', patch: { add: { wires: [{ from: 'a', to: 'out', port: 'out', dep: 'concrete' }] } }, code: 'reparado' }],
  sockets: [
    {
      id: 's',
      at: 'a',
      label: '',
      inventory: ['strategy'],
      options: { strategy: { outcome: 'solves', code: 'patron', note: { title: '', body: '' }, patch: {} } },
    },
  ],
  scenarios: [{ id: 'main', pulses: [{ at: 0, from: 'src' }] }],
  changeTickets: [{ id: 't', text: '', scenario: 'main', without: {}, with: {}, code: { without: 'cambio', with: 'cambio_patron' } }],
  code: {
    rb: Object.fromEntries(['base', 'reparado', 'patron', 'cambio', 'cambio_patron'].map((k) => [k, `# region: A#run\n# ${k}\n# endregion`])),
  },
  ...overrides,
})

describe('defineLevel', () => {
  it('acepta un nivel completo y precompila su código', () => {
    expect(defineLevel(input()).codeFiles.base.text).toBe('# base')
  })

  it('las reparaciones parciales también son alcanzables', () => {
    const variants = reachableVariants(defineLevel(input()))
    expect(variants).toContainEqual({})
    expect(variants).toContainEqual({ repairs: ['r'] })
  })

  it('reporta el código que falta', () => {
    const { patron: _, ...rb } = input().code.rb
    expect(() => defineLevel(input({ code: { rb } }))).toThrow(/falta el código patron/)
  })

  it('reporta un codeRef sin región en el código de la variante', () => {
    const { rb } = input().code
    expect(() => defineLevel(input({ code: { rb: { ...rb, cambio: '# sin regiones' } } }))).toThrow(/a apunta a A#run, que no está en cambio/)
  })

  it('reporta un patrón en el inventario sin opción', () => {
    const [socket] = input().sockets!
    expect(() => defineLevel(input({ sockets: [{ ...socket, inventory: ['strategy', 'observer'] }] }))).toThrow(/observer en inventario sin opción/)
  })

  it('reporta un cable a un nodo inexistente', () => {
    expect(() => defineLevel(input({ repairs: [], circuit: { ...input().circuit, wires: [{ from: 'src', to: 'nadie' }] } }))).toThrow(/destino inexistente nadie/)
  })
})

describe('codeKey', () => {
  const level = defineLevel(input())
  it('prioridad: código del ticket, luego el del patrón, luego el de la reparación, luego base', () => {
    expect(codeKey(level, {})).toBe('base')
    expect(codeKey(level, { repairs: ['r'] })).toBe('reparado')
    expect(codeKey(level, { repairs: ['r'], sockets: [{ id: 's', pattern: 'strategy' }] })).toBe('patron')
    expect(codeKey(level, { ticket: 't' })).toBe('cambio')
    expect(codeKey(level, { sockets: [{ id: 's', pattern: 'strategy' }], ticket: 't' })).toBe('cambio_patron')
  })
})
