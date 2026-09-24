import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L20 · CQRS', () => {
  it('sin patrón: lecturas y escrituras hacen una fila larga', () => {
    expect(evaluate(level, {}).metrics.maxLoad).toBeGreaterThan(3)
  })

  it('CQRS: cada camino con su ritmo, sin filas largas', () => {
    const r = evaluate(level, { socket: { id: 'modelo', pattern: 'cqrs' } })
    expect(r.metrics.maxLoad).toBeLessThanOrEqual(3)
    expect(r.metrics.dropped).toBe(0)
  })
})
