import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'ports-and-adapters' | 'adapter' | 'facade' | 'singleton') => ({ sockets: [{ id: 'dependencias', pattern }] })

describe('L18 · Ports & Adapters', () => {
  it('sin patrón: los pedidos de prueba no tienen base de datos', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 1, dropped: 2 })
  })

  it('Ports & Adapters: el mismo núcleo en pruebas y en producción', () => {
    expect(evaluate(level, socket('ports-and-adapters')).metrics).toMatchObject({ delivered: 3, dropped: 0 })
  })

  it.each(['adapter', 'facade', 'singleton'] as const)('%s: el núcleo sigue atado a la base real', (p) => {
    expect(evaluate(level, socket(p)).metrics.dropped).toBe(2)
  })
})
