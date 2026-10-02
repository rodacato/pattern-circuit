import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const plug = (pattern: 'keep-simple' | 'event-bus' | 'command') => ({ sockets: [{ id: 'notice', pattern }] })

describe('L25 · A single listener', () => {
  it('without notice: the kitchen never receives the orders', () => {
    expect(evaluate(level, {}).metrics.dropped).toBe(3)
  })

  it('a direct call delivers everything with no new pieces', () => {
    const r = evaluate(level, plug('keep-simple'))
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0, nodes: 5 })
    expect(r.won).toBe(true)
  })

  it.each(['event-bus', 'command'] as const)('%s also delivers, but adds a piece between Cobrar and the kitchen', (p) => {
    const r = evaluate(level, plug(p))
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0, nodes: 6 })
    expect(r.won).toBe(false)
  })
})
