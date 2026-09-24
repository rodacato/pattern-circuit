import { describe, expect, it } from 'vitest'
import { initialFlow, reduceFlow, variantFor, type FlowEvent, type FlowState } from './levelFlow'

const socket = { id: 's', at: 'n', label: 'S', inventory: [], options: {} }
const ticket = { id: 't', text: '', scenario: 'x', without: {}, with: {}, code: {} }
const L0 = { sockets: [], changeTickets: [] }
const L1 = { sockets: [socket], changeTickets: [ticket] }
const L3 = { sockets: [socket], changeTickets: [] }

const run = (level: typeof L1 | typeof L0 | typeof L3, ...events: FlowEvent[]): FlowState =>
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
    expect(run(L1, plug('misfit')).plugged).toBeUndefined()
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
    expect(variantFor(L1, choose, repairs)).toEqual({ socket: { id: 's', pattern: 'strategy' } })

    const change = run(L1, finished(false), plug('solves'), finished(true), { type: 'continue' }, { type: 'apply-ticket' })
    expect(variantFor(L1, change, repairs)).toEqual({ socket: { id: 's', pattern: 'strategy' }, ticket: 't' })

    const without = reduceFlow(L1, { ...change, stage: 'compare' }, { type: 'compare', side: 'without' })
    expect(variantFor(L1, without, repairs)).toEqual({ ticket: 't' })
  })

  it('las reparaciones se mantienen en todas las etapas', () => {
    expect(variantFor(L0, initialFlow(), ['r'])).toEqual({ repairs: ['r'] })
  })
})
