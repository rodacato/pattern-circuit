import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const factory = { id: 'crear-bebida', pattern: 'factory-method' as const }
const strategy = { id: 'metodo-de-pago', pattern: 'strategy' as const }

describe('L15 · Factory Method + Strategy', () => {
  it('sin patrones: bebida equivocada y vale perdido', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ invalidAtSink: 1, dropped: 1 })
  })

  it('cada patrón arregla solo su punto de variación', () => {
    expect(evaluate(level, { sockets: [factory] }).metrics).toMatchObject({ invalidAtSink: 0, dropped: 1 })
    expect(evaluate(level, { sockets: [strategy] }).metrics).toMatchObject({ invalidAtSink: 2, dropped: 0 }) // los dos pedidos de Montaña llegan, con latte
  })

  it('juntos resuelven el nivel', () => {
    expect(evaluate(level, { sockets: [factory, strategy] }).won).toBe(true)
  })
})
