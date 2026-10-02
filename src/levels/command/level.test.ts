import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'command' | 'strategy' | 'observer') => ({ sockets: [{ id: 'orders', pattern }] })

describe('L13 · Command', () => {
  it('without a pattern: the latte is made anyway and the cancellation is lost', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1, cancelled: 0 })
  })

  it('Command: the cancellation takes the latte out of the queue before it is made', () => {
    expect(evaluate(level, socket('command')).metrics).toMatchObject({ delivered: 2, cancelled: 1, dropped: 0 })
  })

  it('Observer prepares the cancellation as if it were an order', () => {
    expect(evaluate(level, socket('observer')).metrics.delivered).toBe(4)
  })
})
