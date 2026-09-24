import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'composite' | 'decorator' | 'strategy') => ({ socket: { id: 'combo', pattern } })

describe('L07 · Composite', () => {
  it('sin patrón: el mini combo se pierde y la bandeja nunca se completa', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 1, dropped: 1 })
  })

  it('Composite recorre los niveles y entrega una sola bandeja', () => {
    expect(evaluate(level, socket('composite')).metrics).toMatchObject({ delivered: 2, dropped: 0, duplicatesAtSink: 0 })
  })

  it.each(['decorator', 'strategy'] as const)('%s no sabe desarmar el combo anidado', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(1)
  })
})
