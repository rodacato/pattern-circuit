import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L01 · Strategy', () => {
  const l = level
  const socket = (pattern: 'strategy' | 'observer' | 'decorator') => ({ id: 'payment-method', pattern })

  it('sin patrón: el vale cae en el else y se pierde', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ delivered: 2, dropped: 1 })
  })

  it('sin patrón + pago con app: hay que abrir Cobrar', () => {
    const r = evaluate(l, { ticket: 'app-payment' })
    expect(r.touched).toEqual(['charge'])
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 1, nodesTouched: 1 })
  })

  it('Strategy resuelve, y el pago con app no toca ningún nodo existente', () => {
    expect(evaluate(l, { sockets: [socket('strategy')] }).won).toBe(true)
    const r = evaluate(l, { sockets: [socket('strategy')], ticket: 'app-payment' })
    expect(r.metrics).toMatchObject({ delivered: 4, dropped: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Observer cobra el mismo pedido tres veces', () => {
    const r = evaluate(l, { sockets: [socket('observer')] })
    expect(r.metrics).toMatchObject({ delivered: 9, duplicatesAtSink: 6 })
    expect(r.won).toBe(false)
  })

  it('Decorator envuelve el pedido pero el vale se pierde igual', () => {
    const r = evaluate(l, { sockets: [socket('decorator')] })
    expect(r.metrics).toMatchObject({ delivered: 2, dropped: 1 })
    expect(r.won).toBe(false)
  })
})
