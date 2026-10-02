import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'decorator' | 'strategy' | 'adapter') => ({ id: 'extras', pattern })

describe('L06 · Decorator', () => {
  it('without a pattern: the three-extras combination has no subclass', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('without a pattern + caramel: the menu has to be opened', () => {
    expect(evaluate(level, { ticket: 'caramel' }).touched).toEqual(['menu'])
  })

  it('Decorator applies any combination and the caramel touches nothing existing', () => {
    expect(evaluate(level, { sockets: [socket('decorator')] }).metrics).toMatchObject({ delivered: 4, invalidAtSink: 0 })
    const r = evaluate(level, { sockets: [socket('decorator')], ticket: 'caramel' })
    expect(r.metrics).toMatchObject({ delivered: 5, invalidAtSink: 0, nodesTouched: 0 })
  })

  it('Strategy applies only one extra per drink', () => {
    expect(evaluate(level, { sockets: [socket('strategy')] }).metrics.invalidAtSink).toBe(2)
  })
})
