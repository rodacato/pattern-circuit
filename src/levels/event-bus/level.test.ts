import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'event-bus' | 'observer' | 'facade') => ({ id: 'events', pattern })

describe('L19 · Event Bus', () => {
  it('without a pattern: the return only reaches Inventory', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(7)
  })

  it('without a pattern + Analytics: both producers have to be touched', () => {
    expect(evaluate(level, { ticket: 'analytics' }).touched.sort()).toEqual(['orders', 'returns'])
  })

  it('Event Bus: everyone finds out and Analytics subscribes without touching anything', () => {
    expect(evaluate(level, { sockets: [socket('event-bus')] }).metrics.delivered).toBe(9)
    expect(evaluate(level, { sockets: [socket('event-bus')], ticket: 'analytics' }).metrics).toMatchObject({ delivered: 12, nodesTouched: 0 })
  })

  it('Observer per producer leaves the lists uneven', () => {
    expect(evaluate(level, { sockets: [socket('observer')] }).metrics.delivered).toBe(7)
  })
})
