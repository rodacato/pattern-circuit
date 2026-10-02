import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const composite = { id: 'combo', pattern: 'composite' as const }
const decorator = { id: 'extras', pattern: 'decorator' as const }

describe('L16 · Composite + Decorator', () => {
  it('sin patrones: ningún desayuno llega', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(1)
  })

  it('solo Composite: llegan los desayunos, pero el de dos extras sale incompleto', () => {
    expect(evaluate(level, { sockets: [composite] }).metrics).toMatchObject({ delivered: 3, invalidAtSink: 1 })
  })

  it('juntos: todos los extras aplicados dentro del combo', () => {
    expect(evaluate(level, { sockets: [composite, decorator] }).metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, dropped: 0 })
  })
})
