import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'decorator' | 'strategy' | 'adapter') => ({ id: 'extras', pattern })

describe('L06 · Decorator', () => {
  it('sin patrón: la combinación de tres extras no tiene subclase', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('sin patrón + caramelo: hay que abrir el menú', () => {
    expect(evaluate(level, { ticket: 'caramelo' }).touched).toEqual(['menu'])
  })

  it('Decorator aplica cualquier combinación y el caramelo no toca nada existente', () => {
    expect(evaluate(level, { sockets: [socket('decorator')] }).metrics).toMatchObject({ delivered: 4, invalidAtSink: 0 })
    const r = evaluate(level, { sockets: [socket('decorator')], ticket: 'caramelo' })
    expect(r.metrics).toMatchObject({ delivered: 5, invalidAtSink: 0, nodesTouched: 0 })
  })

  it('Strategy aplica un solo extra por bebida', () => {
    expect(evaluate(level, { sockets: [socket('strategy')] }).metrics.invalidAtSink).toBe(2)
  })
})
