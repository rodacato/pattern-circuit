import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'observer' | 'strategy' | 'chain-of-responsibility') => ({ id: 'avisos', pattern })

describe('L10 · Observer', () => {
  it('sin patrón: Lealtad nunca se entera', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(6)
  })

  it('sin patrón + cocina: hay que abrir el pedido', () => {
    expect(evaluate(level, { ticket: 'cocina' }).touched).toEqual(['listo'])
  })

  it('Observer: todos se enteran y la cocina se suscribe sin tocar nada', () => {
    expect(evaluate(level, { socket: socket('observer') }).metrics.delivered).toBe(9)
    expect(evaluate(level, { socket: socket('observer'), ticket: 'cocina' }).metrics).toMatchObject({ delivered: 12, nodesTouched: 0 })
  })

  it.each(['strategy', 'chain-of-responsibility'] as const)('%s: solo uno se entera', (p) => {
    expect(evaluate(level, { socket: socket(p) }).metrics.delivered).toBe(3)
  })
})
