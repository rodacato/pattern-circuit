import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'circuit-breaker' | 'chain-of-responsibility') => ({ sockets: [{ id: 'provider', pattern }] })

describe('L22 · Circuit Breaker', () => {
  it('without a pattern: every order is lost in the timeout', () => {
    expect(evaluate(level, {}).metrics.dropped).toBe(8)
  })

  it('a memoryless fallback saves the orders, but all wait for the timeout', () => {
    expect(evaluate(level, socket('chain-of-responsibility')).metrics).toMatchObject({ dropped: 0, invalidAtSink: 8 })
  })

  it('Circuit Breaker: after the first failures, the rest go straight to the fallback', () => {
    const r = evaluate(level, socket('circuit-breaker')).metrics
    expect(r.dropped).toBe(0)
    expect(r.invalidAtSink).toBe(3) // only the calls that failed before the breaker opened
  })
})
