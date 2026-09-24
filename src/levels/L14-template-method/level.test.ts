import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = { id: 'receta', pattern: 'template-method' as const }

describe('L14 · Template Method', () => {
  it('sin patrón: el té sale sin tapa', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 4, invalidAtSink: 2 })
  })

  it('sin patrón + manga: la misma edición en las dos copias', () => {
    expect(evaluate(level, { ticket: 'manga' }).touched.sort()).toEqual(['servirT', 'tapaC'])
  })

  it('Template Method: pasos comunes una sola vez', () => {
    expect(evaluate(level, { socket }).metrics.invalidAtSink).toBe(0)
    expect(evaluate(level, { socket, ticket: 'manga' }).touched).toEqual(['tapa'])
  })
})
