import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = { id: 'kitchen', pattern: 'facade' as const }

describe('L08 · Facade', () => {
  it('sin patrón: los lattes de la app salen sin espuma', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 4, invalidAtSink: 2 })
  })

  it('sin patrón + precalentar: el mismo cambio en dos lugares', () => {
    expect(evaluate(level, { ticket: 'preheat' }).touched.sort()).toEqual(['grinder', 'grinderApp'])
  })

  it('Facade: una sola orquestación, un solo lugar que cambiar', () => {
    expect(evaluate(level, { sockets: [socket] }).metrics.invalidAtSink).toBe(0)
    expect(evaluate(level, { sockets: [socket], ticket: 'preheat' }).touched).toEqual(['grinder'])
  })
})
