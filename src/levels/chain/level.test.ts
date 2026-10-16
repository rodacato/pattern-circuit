import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'chain-of-responsibility' | 'strategy' | 'observer') => ({ id: 'approval', pattern })

describe('L12 · Chain of Responsibility', () => {
  it('without a pattern: the huge amount has nobody to handle it', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('without a pattern + supervisor: the cashier has to be opened', () => {
    expect(evaluate(level, { ticket: 'supervisor' }).touched).toEqual(['cashier'])
  })

  it('the chain handles or rejects with a notice, and the supervisor is inserted without touching anyone', () => {
    expect(evaluate(level, { sockets: [socket('chain-of-responsibility')] }).metrics).toMatchObject({ delivered: 4, dropped: 0 })
    const r = evaluate(level, { sockets: [socket('chain-of-responsibility')], ticket: 'supervisor' })
    expect(r.metrics).toMatchObject({ delivered: 5, dropped: 0, nodesTouched: 0 })
  })

  it('Observer pays the same refund several times', () => {
    expect(evaluate(level, { sockets: [socket('observer')] }).metrics.duplicatesAtSink).toBeGreaterThan(0)
  })
})
