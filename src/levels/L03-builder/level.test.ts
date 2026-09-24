import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L03 · Builder', () => {
  const l = level
  const socket = (pattern: 'builder' | 'factory-method' | 'decorator') => ({ id: 'crear-pedido', pattern })

  it('sin patrón: argumentos cruzados y un pedido imposible que explota en cocina', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ invalidAtSink: 1, dropped: 1 })
  })

  it('Builder corrige el orden y rechaza lo imposible antes de cobrar', () => {
    const r = evaluate(l, { socket: socket('builder') })
    expect(r.metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, dropped: 0 })
    expect(r.won).toBe(true)
  })

  it('Factory Method pierde los pedidos que no tienen molde', () => {
    expect(evaluate(l, { socket: socket('factory-method') }).metrics).toMatchObject({ delivered: 1, dropped: 2 })
  })

  it('Decorator arregla los extras pero lo imposible sigue llegando a cocina', () => {
    const r = evaluate(l, { socket: socket('decorator') })
    expect(r.metrics).toMatchObject({ invalidAtSink: 0, dropped: 1 })
    expect(r.won).toBe(false)
  })
})
