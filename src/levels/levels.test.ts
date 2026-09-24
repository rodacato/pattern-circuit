import { describe, expect, it } from 'vitest'
import { evaluate, reachableVariants } from '../engine'
import { LEVELS } from '.'

const level = (id: string) => LEVELS.find((l) => l.id === id)!

describe('registro de niveles', () => {
  it('descubre los niveles en orden', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['L00-tutorial', 'L01-strategy'])
  })

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: cada variante alcanzable termina su simulación', (_id, l) => {
    for (const v of reachableVariants(l)) expect(() => evaluate(l, v)).not.toThrow()
  })
})

describe('L00 · Abre la cafetería', () => {
  const l = level('L00-tutorial')

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

describe('L01 · Strategy', () => {
  const l = level('L01-strategy')
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
