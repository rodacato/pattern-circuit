import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L02 · Factory Method', () => {
  const l = level
  const socket = (pattern: 'factory-method' | 'singleton' | 'builder') => ({ id: 'create-drink', pattern })

  it('without a pattern: Montaña receives a latte', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ delivered: 3, invalidAtSink: 1 })
  })

  it('without a pattern + Puerto branch: the shared flow has to be opened', () => {
    const r = evaluate(l, { ticket: 'harbor-branch' })
    expect(r.touched).toEqual(['create'])
    expect(r.metrics.invalidAtSink).toBe(1)
  })

  it('Factory Method solves it and Puerto touches no existing nodes', () => {
    expect(evaluate(l, { sockets: [socket('factory-method')] }).won).toBe(true)
    const r = evaluate(l, { sockets: [socket('factory-method')], ticket: 'harbor-branch' })
    expect(r.metrics).toMatchObject({ delivered: 4, invalidAtSink: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Singleton gives the same thing to every branch', () => {
    expect(evaluate(l, { sockets: [socket('singleton')] }).metrics.invalidAtSink).toBe(2)
  })

  it('Builder assembles steps but the if still chooses wrongly', () => {
    expect(evaluate(l, { sockets: [socket('builder')] }).metrics.invalidAtSink).toBe(1)
  })
})
