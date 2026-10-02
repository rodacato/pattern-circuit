import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const plug = (pattern: 'keep-simple' | 'strategy' | 'factory-method') => ({ sockets: [{ id: 'charging', pattern }] })

describe('L24 · A single payment method', () => {
  it('without a fix: every charge includes the VAT twice', () => {
    expect(evaluate(level, {}).metrics.invalidAtSink).toBe(3)
  })

  it('keep it simple: the charges come out right with the same five pieces', () => {
    const r = evaluate(level, plug('keep-simple'))
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, nodes: 5 })
    expect(r.won).toBe(true)
  })

  it.each(['strategy', 'factory-method'] as const)('%s also charges correctly, but with a piece nobody needs', (p) => {
    const r = evaluate(level, plug(p))
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, nodes: 6 })
    expect(r.won).toBe(false)
  })
})
