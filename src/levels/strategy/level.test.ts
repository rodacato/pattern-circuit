import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L01 · Strategy', () => {
  const l = level
  const socket = (pattern: 'strategy' | 'observer' | 'decorator') => ({ id: 'payment-method', pattern })

  it('without a pattern: the voucher falls into the else and is lost', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ delivered: 2, dropped: 1 })
  })

  it('without a pattern + app payment: Cobrar has to be opened', () => {
    const r = evaluate(l, { ticket: 'app-payment' })
    expect(r.touched).toEqual(['charge'])
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 1, nodesTouched: 1 })
  })

  it('Strategy solves it, and the app payment touches no existing node', () => {
    expect(evaluate(l, { sockets: [socket('strategy')] }).won).toBe(true)
    const r = evaluate(l, { sockets: [socket('strategy')], ticket: 'app-payment' })
    expect(r.metrics).toMatchObject({ delivered: 4, dropped: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Observer charges the same order three times', () => {
    const r = evaluate(l, { sockets: [socket('observer')] })
    expect(r.metrics).toMatchObject({ delivered: 9, duplicatesAtSink: 6 })
    expect(r.won).toBe(false)
  })

  it('Decorator wraps the order but the voucher is lost anyway', () => {
    const r = evaluate(l, { sockets: [socket('decorator')] })
    expect(r.metrics).toMatchObject({ delivered: 2, dropped: 1 })
    expect(r.won).toBe(false)
  })
})
