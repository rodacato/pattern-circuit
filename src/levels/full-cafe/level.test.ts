import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L26 · The full café', () => {
  it('everything works together: rejects the impossible, cancels in time and notifies everyone', () => {
    const r = evaluate(level, {})
    expect(r.metrics).toMatchObject({ delivered: 5, cancelled: 1, dropped: 0 })
    expect(r.won).toBe(true)
  })
})
