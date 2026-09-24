import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L09 · Proxy', () => {
  it('sin patrón: se forma fila frente al almacén', () => {
    expect(evaluate(level, {}).metrics.maxLoad).toBeGreaterThan(3)
  })

  it('Proxy: solo lo nuevo viaja al almacén', () => {
    const r = evaluate(level, { sockets: [{ id: 'inventario', pattern: 'proxy' }] })
    expect(r.metrics).toMatchObject({ delivered: 6 })
    expect(r.metrics.maxLoad).toBe(2)
  })
})
