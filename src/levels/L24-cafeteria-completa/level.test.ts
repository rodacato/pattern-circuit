import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L24 · La cafetería completa', () => {
  it('todo funciona junto: rechaza lo imposible, cancela a tiempo y avisa a todos', () => {
    const r = evaluate(level, {})
    expect(r.metrics).toMatchObject({ delivered: 5, cancelled: 1, dropped: 0 })
    expect(r.won).toBe(true)
  })
})
