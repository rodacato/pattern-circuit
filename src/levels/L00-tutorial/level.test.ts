import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L00 · Abre la cafetería', () => {
  const l = level

  it('sin el cable, los pedidos se pierden en Preparar', () => {
    const r = evaluate(l, {})
    expect(r.metrics).toMatchObject({ delivered: 0, dropped: 3 })
    expect(r.won).toBe(false)
  })

  it('con el cable reparado, se gana', () => {
    const r = evaluate(l, { repairs: ['conectar-entrega'] })
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0 })
    expect(r.won).toBe(true)
  })
})
