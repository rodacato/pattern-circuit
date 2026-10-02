import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const plug = (pattern: 'keep-simple' | 'event-bus' | 'command') => ({ sockets: [{ id: 'aviso', pattern }] })

describe('L25 · Un solo interesado', () => {
  it('sin aviso: la cocina nunca recibe los pedidos', () => {
    expect(evaluate(level, {}).metrics.dropped).toBe(3)
  })

  it('una llamada directa entrega todo sin piezas nuevas', () => {
    const r = evaluate(level, plug('keep-simple'))
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0, nodes: 5 })
    expect(r.won).toBe(true)
  })

  it.each(['event-bus', 'command'] as const)('%s también entrega, pero agrega una pieza entre Cobrar y la cocina', (p) => {
    const r = evaluate(level, plug(p))
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0, nodes: 6 })
    expect(r.won).toBe(false)
  })
})
