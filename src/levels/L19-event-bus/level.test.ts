import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'event-bus' | 'observer' | 'facade') => ({ id: 'eventos', pattern })

describe('L19 · Event Bus', () => {
  it('sin patrón: la devolución solo llega a Inventario', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(7)
  })

  it('sin patrón + Analytics: hay que tocar a los dos productores', () => {
    expect(evaluate(level, { ticket: 'analytics' }).touched.sort()).toEqual(['orders', 'returns'])
  })

  it('Event Bus: todos se enteran y Analytics se suscribe sin tocar nada', () => {
    expect(evaluate(level, { socket: socket('event-bus') }).metrics.delivered).toBe(9)
    expect(evaluate(level, { socket: socket('event-bus'), ticket: 'analytics' }).metrics).toMatchObject({ delivered: 12, nodesTouched: 0 })
  })

  it('Observer por productor deja las listas desparejas', () => {
    expect(evaluate(level, { socket: socket('observer') }).metrics.delivered).toBe(7)
  })
})
