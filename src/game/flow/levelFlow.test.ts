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

describe('level flow', () => {
  it('without sockets: completes on winning a run', () => {
    expect(run(L0, finished(false)).stage).toBe('observe')
    expect(run(L0, finished(false), finished(true)).stage).toBe('complete')
  })

  it('with sockets: seeing the problem opens the inventory', () => {
    expect(run(L1, finished(false)).stage).toBe('choose')
    expect(run(L1, plug('misfit')).plugs).toEqual({})
  })

  it('a pattern that does not fit does not let you continue', () => {
    const s = run(L1, finished(false), plug('misfit'), finished(false), { type: 'continue' })
    expect(s.stage).toBe('choose')
    expect(s.solved).toBe(false)
  })

  it('a partial pattern does not resolve even if the run wins', () => {
    expect(run(L1, finished(false), plug('partial'), finished(true)).solved).toBe(false)
  })

  it('full path: choose, change, compare, finish', () => {
    let s = run(L1, finished(false), plug('solves'), finished(true), { type: 'continue' })
    expect(s.stage).toBe('change')
    s = reduceFlow(L1, s, { type: 'continue' })
    expect(s.stage).toBe('change') // the ticket is still to be applied
    s = [{ type: 'apply-ticket' } as const, finished(true), { type: 'continue' } as const].reduce((a, e) => reduceFlow(L1, a, e), s)
    expect(s.stage).toBe('compare')
    s = reduceFlow(L1, s, { type: 'compare', side: 'without' })
    expect(s.side).toBe('without')
    expect(reduceFlow(L1, s, { type: 'finish' }).stage).toBe('complete')
  })

  it('without tickets the change stage is skipped', () => {
    expect(run(L3, finished(false), plug('solves'), finished(true), { type: 'continue' }).stage).toBe('compare')
  })

  it('switching pattern invalidates the previous solution', () => {
    expect(run(L1, finished(false), plug('solves'), finished(true), plug('misfit')).solved).toBe(false)
  })
})

describe('variant according to the flow', () => {
  it('each stage runs the circuit that belongs to it', () => {
    const repairs: string[] = []
    const choose = run(L1, finished(false), plug('solves'))
    expect(variantFor(L1, initialFlow(), repairs)).toEqual({})
    expect(variantFor(L1, choose, repairs)).toEqual({ sockets: [{ id: 's', pattern: 'strategy' }] })

    const change = run(L1, finished(false), plug('solves'), finished(true), { type: 'continue' }, { type: 'apply-ticket' })
    expect(variantFor(L1, change, repairs)).toEqual({ sockets: [{ id: 's', pattern: 'strategy' }], ticket: 't' })

    const without = reduceFlow(L1, { ...change, stage: 'compare' }, { type: 'compare', side: 'without' })
    expect(variantFor(L1, without, repairs)).toEqual({ ticket: 't' })
  })

  it('repairs are kept in every stage', () => {
    expect(variantFor(L0, initialFlow(), ['r'])).toEqual({ repairs: ['r'] })
  })
})

describe('flow with several sockets', () => {
  const other = { ...socket, id: 'o' }
  const L2 = { sockets: [socket, other], changeTickets: [] }
  const plugAt = (socketId: string, outcome: 'solves' | 'misfit'): FlowEvent => ({ type: 'plug', socketId, pattern: 'strategy', outcome })

  it('only resolves with every socket resolved', () => {
    expect(run(L2, finished(false), plugAt('s', 'solves'), finished(true)).solved).toBe(false)
    const s = run(L2, finished(false), plugAt('s', 'solves'), plugAt('o', 'solves'), finished(true))
    expect(s.solved).toBe(true)
    expect(s.last).toBe('o')
    expect(variantFor(L2, s, []).sockets).toHaveLength(2)
  })

  it('unplugging one socket leaves the other', () => {
    const s = run(L2, finished(false), plugAt('s', 'solves'), plugAt('o', 'misfit'), { type: 'unplug', socketId: 'o' })
    expect(Object.keys(s.plugs)).toEqual(['s'])
  })
})

describe('flow selectors', () => {
  const option = (outcome: 'solves' | 'misfit') => ({ outcome, code: '', note: { title: outcome, body: '' }, patch: {} })
  const a = { id: 'a', at: 'n', label: 'A', inventory: ['strategy' as const], options: { strategy: option('solves') } }
  const b = { id: 'b', at: 'm', label: 'B', inventory: ['strategy' as const, 'observer' as const], options: { strategy: option('solves'), observer: option('misfit') } }
  const level = { sockets: [a, b], changeTickets: [ticket] }
  const plugAt = (socketId: string, pattern: 'strategy' | 'observer', outcome: 'solves' | 'misfit'): FlowEvent => ({ type: 'plug', socketId, pattern, outcome })

  it('stagesFor skips the stages the level does not use', () => {
    expect(stagesFor(L0)).toEqual(['observe'])
    expect(stagesFor(L3)).toEqual(['observe', 'choose', 'compare'])
    expect(stagesFor(L1)).toEqual(['observe', 'choose', 'change', 'compare'])
  })

  it('targetSocket respects the requested socket and, if none, prefers an unresolved one', () => {
    const start = run(level, finished(false))
    expect(targetSocket(level, start, 'observer')?.id).toBe('b')
    expect(targetSocket(level, start, 'strategy')?.id).toBe('a')
    expect(targetSocket(level, start, 'strategy', 'b')?.id).toBe('b')
    expect(targetSocket(level, start, 'observer', 'a')).toBeUndefined()
    const aSolved = reduceFlow(level, start, plugAt('a', 'strategy', 'solves'))
    expect(targetSocket(level, aSolved, 'strategy')?.id).toBe('b')
  })

  it('patterns, pending sockets and last note follow the level order', () => {
    const s = run(level, finished(false), plugAt('b', 'observer', 'misfit'), plugAt('a', 'strategy', 'solves'))
    expect(pluggedPatterns(level, s)).toEqual(['strategy', 'observer'])
    expect(pendingSockets(level, s).map((k) => k.id)).toEqual(['b'])
    expect(lastPluggedOption(level, s)?.note.title).toBe('solves')
  })
})
