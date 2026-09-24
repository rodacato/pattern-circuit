import { describe, expect, it } from 'vitest'
import { evaluate, reachableVariants } from '../engine'
import { LEVELS } from '.'

const level = (id: string) => LEVELS.find((l) => l.id === id)!

describe('registro de niveles', () => {
  it('descubre los niveles en orden', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['L00-tutorial', 'L01-strategy', 'L02-factory-method', 'L03-builder'])
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

describe('L02 · Factory Method', () => {
  const l = level('L02-factory-method')
  const socket = (pattern: 'factory-method' | 'singleton' | 'builder') => ({ id: 'crear-bebida', pattern })

  it('sin patrón: Montaña recibe un latte', () => {
    expect(evaluate(l, {}).metrics).toMatchObject({ delivered: 3, invalidAtSink: 1 })
  })

  it('sin patrón + sucursal Puerto: hay que abrir el flujo compartido', () => {
    const r = evaluate(l, { ticket: 'sucursal-puerto' })
    expect(r.touched).toEqual(['crear'])
    expect(r.metrics.invalidAtSink).toBe(1)
  })

  it('Factory Method resuelve y Puerto no toca nodos existentes', () => {
    expect(evaluate(l, { socket: socket('factory-method') }).won).toBe(true)
    const r = evaluate(l, { socket: socket('factory-method'), ticket: 'sucursal-puerto' })
    expect(r.metrics).toMatchObject({ delivered: 4, invalidAtSink: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Singleton le da lo mismo a todas las sucursales', () => {
    expect(evaluate(l, { socket: socket('singleton') }).metrics.invalidAtSink).toBe(2)
  })

  it('Builder arma pasos pero el if sigue eligiendo mal', () => {
    expect(evaluate(l, { socket: socket('builder') }).metrics.invalidAtSink).toBe(1)
  })
})

describe('L03 · Builder', () => {
  const l = level('L03-builder')
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
