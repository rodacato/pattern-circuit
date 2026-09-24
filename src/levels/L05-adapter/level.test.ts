import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'adapter' | 'decorator' | 'facade') => ({ socket: { id: 'pasarela', pattern } })

describe('L05 · Adapter', () => {
  it('sin patrón: la terminal rechaza todos los pagos', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 0, dropped: 3 })
  })

  it('Adapter traduce el formato y todo pasa', () => {
    expect(evaluate(level, socket('adapter')).metrics).toMatchObject({ delivered: 3, dropped: 0 })
  })

  it.each(['decorator', 'facade'] as const)('%s no cambia el formato: se sigue rechazando', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(3)
  })
})
