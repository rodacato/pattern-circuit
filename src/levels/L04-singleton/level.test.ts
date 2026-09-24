import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'singleton' | 'factory-method' | 'strategy') => ({ socket: { id: 'contador', pattern } })

describe('L04 · Singleton', () => {
  it('sin patrón: cada caja reparte los mismos turnos', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 6, invalidAtSink: 3 })
  })

  it('Singleton: un solo contador, turnos únicos', () => {
    expect(evaluate(level, socket('singleton')).metrics.invalidAtSink).toBe(0)
  })

  it('Factory Method: contador nuevo en cada pedido, todos son el turno 1', () => {
    expect(evaluate(level, socket('factory-method')).metrics.invalidAtSink).toBe(5)
  })

  it('Strategy: cada caja sigue con su propia cuenta', () => {
    expect(evaluate(level, socket('strategy')).metrics.invalidAtSink).toBe(3)
  })
})
