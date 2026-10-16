import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'observer' | 'strategy' | 'chain-of-responsibility') => ({ id: 'notices', pattern })

describe('L10 · Observer', () => {
  it('without a pattern: Loyalty never finds out', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(6)
  })

  it('without a pattern + kitchen: the order has to be opened', () => {
    expect(evaluate(level, { ticket: 'kitchen' }).touched).toEqual(['ready'])
  })

  it('Observer: everyone finds out and the kitchen subscribes without touching anything', () => {
    expect(evaluate(level, { sockets: [socket('observer')] }).metrics.delivered).toBe(9)
    expect(evaluate(level, { sockets: [socket('observer')], ticket: 'kitchen' }).metrics).toMatchObject({ delivered: 12, nodesTouched: 0 })
  })

  it.each(['strategy', 'chain-of-responsibility'] as const)('%s: only one finds out', (p) => {
    expect(evaluate(level, { sockets: [socket(p)] }).metrics.delivered).toBe(3)
  })
})
