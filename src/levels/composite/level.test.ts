import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'composite' | 'decorator' | 'strategy') => ({ sockets: [{ id: 'combo', pattern }] })

describe('L07 · Composite', () => {
  it('without a pattern: the mini combo is lost and the tray never completes', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 1, dropped: 1 })
  })

  it('Composite walks the levels and delivers a single tray', () => {
    expect(evaluate(level, socket('composite')).metrics).toMatchObject({ delivered: 2, dropped: 0, duplicatesAtSink: 0 })
  })

  it.each(['decorator', 'strategy'] as const)('%s cannot unpack the nested combo', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(1)
  })
})
