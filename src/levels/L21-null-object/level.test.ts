import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L21 · Null Object', () => {
  it('sin patrón: los clientes sin tarjeta explotan en el primer uso', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 2, dropped: 2 })
  })

  it('Null Object: todos pasan sin cambiar a quienes usan la tarjeta', () => {
    expect(evaluate(level, { socket: { id: 'tarjeta', pattern: 'null-object' } }).metrics).toMatchObject({ delivered: 4, dropped: 0 })
  })
})
