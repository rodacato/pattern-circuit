import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L02 · Factory Method', () => {
  const l = level
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
    expect(evaluate(l, { sockets: [socket('factory-method')] }).won).toBe(true)
    const r = evaluate(l, { sockets: [socket('factory-method')], ticket: 'sucursal-puerto' })
    expect(r.metrics).toMatchObject({ delivered: 4, invalidAtSink: 0, nodesTouched: 0 })
    expect(r.won).toBe(true)
  })

  it('Singleton le da lo mismo a todas las sucursales', () => {
    expect(evaluate(l, { sockets: [socket('singleton')] }).metrics.invalidAtSink).toBe(2)
  })

  it('Builder arma pasos pero el if sigue eligiendo mal', () => {
    expect(evaluate(l, { sockets: [socket('builder')] }).metrics.invalidAtSink).toBe(1)
  })
})
