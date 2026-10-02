import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L20 · CQRS', () => {
  it('without a pattern: reads and writes form a long queue', () => {
    expect(evaluate(level, {}).metrics.maxLoad).toBeGreaterThan(3)
  })

  it('CQRS: each path at its own pace, no long queues', () => {
    const r = evaluate(level, { sockets: [{ id: 'model', pattern: 'cqrs' }] })
    expect(r.metrics.maxLoad).toBe(3)
    expect(r.metrics.dropped).toBe(0)
  })
})
