import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'adapter' | 'decorator' | 'facade') => ({ sockets: [{ id: 'gateway', pattern }] })

describe('L05 · Adapter', () => {
  it('without a pattern: the terminal rejects every payment', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 0, dropped: 3 })
  })

  it('Adapter translates the format and everything goes through', () => {
    expect(evaluate(level, socket('adapter')).metrics).toMatchObject({ delivered: 3, dropped: 0 })
  })

  it.each(['decorator', 'facade'] as const)('%s does not change the format: still rejected', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(3)
  })
})
