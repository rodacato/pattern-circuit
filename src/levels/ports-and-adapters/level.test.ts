import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'ports-and-adapters' | 'adapter' | 'facade' | 'singleton') => ({ sockets: [{ id: 'dependencies', pattern }] })

describe('L18 · Ports & Adapters', () => {
  it('without a pattern: test orders have no database', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 1, dropped: 2 })
  })

  it('Ports & Adapters: the same core in tests and in production', () => {
    expect(evaluate(level, socket('ports-and-adapters')).metrics).toMatchObject({ delivered: 3, dropped: 0 })
  })

  it.each(['adapter', 'facade', 'singleton'] as const)('%s: the core stays tied to the real database', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(2)
  })
})
