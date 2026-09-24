import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const plug = (pattern: 'keep-simple' | 'strategy' | 'factory-method') => ({ sockets: [{ id: 'cobro', pattern }] })

describe('L24 · Un solo método de pago', () => {
  it('sin arreglo: cada cobro lleva el IVA dos veces', () => {
    expect(evaluate(level, {}).metrics.invalidAtSink).toBe(3)
  })

  it('mantenerlo simple: los cobros salen bien con las mismas cinco piezas', () => {
    const r = evaluate(level, plug('keep-simple'))
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, nodes: 5 })
    expect(r.won).toBe(true)
  })

  it.each(['strategy', 'factory-method'] as const)('%s también cobra bien, pero con una pieza que nadie necesita', (p) => {
    const r = evaluate(level, plug(p))
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, nodes: 6 })
    expect(r.won).toBe(false)
  })
})
