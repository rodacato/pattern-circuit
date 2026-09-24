import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'circuit-breaker' | 'chain-of-responsibility') => ({ socket: { id: 'proveedor', pattern } })

describe('L22 · Circuit Breaker', () => {
  it('sin patrón: todos los pedidos se pierden en el timeout', () => {
    expect(evaluate(level, {}).metrics.dropped).toBe(8)
  })

  it('un respaldo sin memoria salva los pedidos, pero todos esperan el timeout', () => {
    expect(evaluate(level, socket('chain-of-responsibility')).metrics).toMatchObject({ dropped: 0, invalidAtSink: 8 })
  })

  it('Circuit Breaker: tras los primeros fallos, el resto va directo al respaldo', () => {
    const r = evaluate(level, socket('circuit-breaker')).metrics
    expect(r.dropped).toBe(0)
    expect(r.invalidAtSink).toBeLessThanOrEqual(3)
  })
})
