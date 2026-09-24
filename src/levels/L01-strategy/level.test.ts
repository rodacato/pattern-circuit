import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L01 · Strategy', () => {
  const l = level
  const socket = (pattern: 'strategy' | 'observer' | 'decorator') => ({ id: 'metodo-de-pago', pattern })

  it('sin patrón: el vale cae en el else y se pierde', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ delivered: 2, dropped: 1 })
  })

  it('sin patrón + pago con app: hay que abrir Cobrar', () => {
    const r = evaluate(l, { ticket: 'pago-app' })
    expect(r.touched).toEqual(['cobrar'])
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 1, nodesTouched: 1 })
  })

  it('Strategy resuelve, y el pago con app no toca ningún nodo existente', () => {
    expect(evaluate(l, { socket: socket('strategy') }).won).toBe(true)
    const r = evaluate(l, { socket: socket('strategy'), ticket: 'pago-app' })
    expect(r.metrics).toMatchObject({ delivered: 4, dropped: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Observer cobra el mismo pedido tres veces', () => {
    const r = evaluate(l, { socket: socket('observer') })
    expect(r.metrics).toMatchObject({ delivered: 9, duplicatesAtSink: 6 })
    expect(r.won).toBe(false)
  })

  it('Decorator envuelve el pedido pero el vale se pierde igual', () => {
    const r = evaluate(l, { socket: socket('decorator') })
    expect(r.metrics).toMatchObject({ delivered: 2, dropped: 1 })
    expect(r.won).toBe(false)
  })
})
