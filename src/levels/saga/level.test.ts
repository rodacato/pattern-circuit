import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'saga' | 'command' | 'observer') => ({ sockets: [{ id: 'steps', pattern }] })

describe('L23 · Saga', () => {
  it('without a pattern: the customer without oat paid and got nothing', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('Saga: the failure compensates the charge with a refund', () => {
    expect(evaluate(level, socket('saga')).metrics).toMatchObject({ delivered: 4, dropped: 0, invalidAtSink: 0 })
  })

  it('Observer notifies but does not refund', () => {
    expect(evaluate(level, socket('observer')).metrics.invalidAtSink).toBe(1)
  })
})
