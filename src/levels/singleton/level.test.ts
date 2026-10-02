import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'singleton' | 'factory-method' | 'strategy') => ({ sockets: [{ id: 'ticketCounter', pattern }] })

describe('L04 · Singleton', () => {
  it('without a pattern: each register hands out the same turns', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 6, invalidAtSink: 3 })
  })

  it('Singleton: a single counter, unique turns', () => {
    expect(evaluate(level, socket('singleton')).metrics.invalidAtSink).toBe(0)
  })

  it('Factory Method: a new counter on each order, all are turn 1', () => {
    expect(evaluate(level, socket('factory-method')).metrics.invalidAtSink).toBe(5)
  })

  it('Strategy: each register keeps its own count', () => {
    expect(evaluate(level, socket('strategy')).metrics.invalidAtSink).toBe(3)
  })
})
