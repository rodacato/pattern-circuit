import { describe, expect, it } from 'vitest'
import { initialFlow, lastPluggedOption, pendingSockets, pluggedPatterns, reduceFlow, stagesFor, targetSocket, variantFor, type FlowEvent, type FlowState } from './levelFlow'

const socket = { id: 's', at: 'n', label: 'S', inventory: [], options: {} }
const ticket = { id: 't', text: '', scenario: 'x', without: {}, with: {}, code: {} }
const L0 = { sockets: [], changeTickets: [] }
const L1 = { sockets: [socket], changeTickets: [ticket] }
const L3 = { sockets: [socket], changeTickets: [] }

const run = (level: Parameters<typeof reduceFlow>[0], ...events: FlowEvent[]): FlowState =>
  events.reduce((s, e) => reduceFlow(level, s, e), initialFlow())

const plug = (outcome: 'solves' | 'partial' | 'misfit'): FlowEvent => ({ type: 'plug', socketId: 's', pattern: 'strategy', outcome })
const finished = (won: boolean): FlowEvent => ({ type: 'run-finished', won })

describe('flujo del nivel', () => {
  it('sin sockets: se completa al ganar una corrida', () => {
    expect(run(L0, finished(false)).stage).toBe('observe')
    expect(run(L0, finished(false), finished(true)).stage).toBe('complete')
  })

  it('con sockets: ver el problema abre el inventario', () => {
    expect(run(L1, finished(false)).stage).toBe('choose')
    expect(run(L1, plug('misfit')).plugs).toEqual({})
  })

  it('un patrón que no encaja no deja continuar', () => {
    const s = run(L1, finished(false), plug('misfit'), finished(false), { type: 'continue' })
    expect(s.stage).toBe('choose')
    expect(s.solved).toBe(false)
  })

  it('un patrón parcial no resuelve aunque la corrida gane', () => {
    expect(run(L1, finished(false), plug('partial'), finished(true)).solved).toBe(false)
  })

  it('camino completo: elegir, cambio, comparar, terminar', () => {
    let s = run(L1, finished(false), plug('solves'), finished(true), { type: 'continue' })
    expect(s.stage).toBe('change')
    s = reduceFlow(L1, s, { type: 'continue' })
    expect(s.stage).toBe('change') // falta aplicar el ticket
    s = [{ type: 'apply-ticket' } as const, finished(true), { type: 'continue' } as const].reduce((a, e) => reduceFlow(L1, a, e), s)
    expect(s.stage).toBe('compare')
    s = reduceFlow(L1, s, { type: 'compare', side: 'without' })
    expect(s.side).toBe('without')
    expect(reduceFlow(L1, s, { type: 'finish' }).stage).toBe('complete')
  })

  it('sin tickets se salta la etapa de cambio', () => {
    expect(run(L3, finished(false), plug('solves'), finished(true), { type: 'continue' }).stage).toBe('compare')
  })

  it('cambiar de patrón invalida la solución anterior', () => {
    expect(run(L1, finished(false), plug('solves'), finished(true), plug('misfit')).solved).toBe(false)
  })
})

describe('variante según el flujo', () => {
  it('cada etapa corre el circuito que le toca', () => {
    const repairs: string[] = []
    const choose = run(L1, finished(false), plug('solves'))
    expect(variantFor(L1, initialFlow(), repairs)).toEqual({})
    expect(variantFor(L1, choose, repairs)).toEqual({ sockets: [{ id: 's', pattern: 'strategy' }] })

    const change = run(L1, finished(false), plug('solves'), finished(true), { type: 'continue' }, { type: 'apply-ticket' })
    expect(variantFor(L1, change, repairs)).toEqual({ sockets: [{ id: 's', pattern: 'strategy' }], ticket: 't' })

    const without = reduceFlow(L1, { ...change, stage: 'compare' }, { type: 'compare', side: 'without' })
    expect(variantFor(L1, without, repairs)).toEqual({ ticket: 't' })
  })

  it('las reparaciones se mantienen en todas las etapas', () => {
    expect(variantFor(L0, initialFlow(), ['r'])).toEqual({ repairs: ['r'] })
  })
})

describe('flujo con varios sockets', () => {
  const other = { ...socket, id: 'o' }
  const L2 = { sockets: [socket, other], changeTickets: [] }
  const plugAt = (socketId: string, outcome: 'solves' | 'misfit'): FlowEvent => ({ type: 'plug', socketId, pattern: 'strategy', outcome })

  it('solo se resuelve con todos los sockets resueltos', () => {
    expect(run(L2, finished(false), plugAt('s', 'solves'), finished(true)).solved).toBe(false)
    const s = run(L2, finished(false), plugAt('s', 'solves'), plugAt('o', 'solves'), finished(true))
    expect(s.solved).toBe(true)
    expect(s.last).toBe('o')
    expect(variantFor(L2, s, []).sockets).toHaveLength(2)
  })

  it('desenchufar un socket deja el otro', () => {
    const s = run(L2, finished(false), plugAt('s', 'solves'), plugAt('o', 'misfit'), { type: 'unplug', socketId: 'o' })
    expect(Object.keys(s.plugs)).toEqual(['s'])
  })
})

describe('selectores del flujo', () => {
  const option = (outcome: 'solves' | 'misfit') => ({ outcome, code: '', note: { title: outcome, body: '' }, patch: {} })
  const a = { id: 'a', at: 'n', label: 'A', inventory: ['strategy' as const], options: { strategy: option('solves') } }
  const b = { id: 'b', at: 'm', label: 'B', inventory: ['strategy' as const, 'observer' as const], options: { strategy: option('solves'), observer: option('misfit') } }
  const level = { sockets: [a, b], changeTickets: [ticket] }
  const plugAt = (socketId: string, pattern: 'strategy' | 'observer', outcome: 'solves' | 'misfit'): FlowEvent => ({ type: 'plug', socketId, pattern, outcome })

  it('stagesFor salta las etapas que el nivel no usa', () => {
    expect(stagesFor(L0)).toEqual(['observe'])
    expect(stagesFor(L3)).toEqual(['observe', 'choose', 'compare'])
    expect(stagesFor(L1)).toEqual(['observe', 'choose', 'change', 'compare'])
  })

  it('targetSocket respeta el socket pedido y, si no hay, prefiere uno sin resolver', () => {
    const start = run(level, finished(false))
    expect(targetSocket(level, start, 'observer')?.id).toBe('b')
    expect(targetSocket(level, start, 'strategy')?.id).toBe('a')
    expect(targetSocket(level, start, 'strategy', 'b')?.id).toBe('b')
    expect(targetSocket(level, start, 'observer', 'a')).toBeUndefined()
    const aSolved = reduceFlow(level, start, plugAt('a', 'strategy', 'solves'))
    expect(targetSocket(level, aSolved, 'strategy')?.id).toBe('b')
  })

  it('patrones, sockets pendientes y última nota siguen el orden del nivel', () => {
    const s = run(level, finished(false), plugAt('b', 'observer', 'misfit'), plugAt('a', 'strategy', 'solves'))
    expect(pluggedPatterns(level, s)).toEqual(['strategy', 'observer'])
    expect(pendingSockets(level, s).map((k) => k.id)).toEqual(['b'])
    expect(lastPluggedOption(level, s)?.note.title).toBe('solves')
  })
})
