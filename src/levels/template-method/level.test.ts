import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = { id: 'recipe', pattern: 'template-method' as const }

describe('L14 · Template Method', () => {
  it('sin patrón: el té sale sin tapa', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 4, invalidAtSink: 2 })
  })

  it('sin patrón + manga: la misma edición en las dos copias', () => {
    expect(evaluate(level, { ticket: 'sleeve' }).touched.sort()).toEqual(['lidC', 'serveT'])
  })

  it('Template Method: pasos comunes una sola vez', () => {
    expect(evaluate(level, { sockets: [socket] }).metrics.invalidAtSink).toBe(0)
    expect(evaluate(level, { sockets: [socket], ticket: 'sleeve' }).touched).toEqual(['lid'])
  })
})
