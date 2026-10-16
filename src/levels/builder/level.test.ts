import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L03 · Builder', () => {
  const l = level
  const socket = (pattern: 'builder' | 'factory-method' | 'decorator') => ({ id: 'create-order', pattern })

  it('without a pattern: crossed arguments and an impossible order that blows up in the kitchen', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ invalidAtSink: 1, dropped: 1 })
  })

  it('Builder fixes the order and rejects the impossible before charging', () => {
    const r = evaluate(l, { sockets: [socket('builder')] })
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, dropped: 0 })
    expect(r.won).toBe(true)
  })

  it('Factory Method drops the orders that have no mold', () => {
    expect(evaluate(l, { sockets: [socket('factory-method')] }).metrics).toMatchObject({ delivered: 1, dropped: 2 })
  })

  it('Decorator fixes the extras but the impossible still reaches the kitchen', () => {
    const r = evaluate(l, { sockets: [socket('decorator')] })
    expect(r.metrics).toMatchObject({ invalidAtSink: 0, dropped: 1 })
    expect(r.won).toBe(false)
  })
})
