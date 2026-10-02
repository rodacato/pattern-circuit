import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L09 · Proxy', () => {
  it('without a pattern: a queue forms in front of the warehouse', () => {
    expect(evaluate(level, {}).metrics.maxLoad).toBeGreaterThan(3)
  })

  it('Proxy: only the new goes to the warehouse', () => {
    const r = evaluate(level, { sockets: [{ id: 'inventory', pattern: 'proxy' }] })
    expect(r.metrics).toMatchObject({ delivered: 6 })
    expect(r.metrics.maxLoad).toBe(2)
  })
})
