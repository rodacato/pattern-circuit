import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const command = { id: 'eventos', pattern: 'command' as const }
const state = { id: 'estados', pattern: 'state' as const }
const observer = { id: 'avisos', pattern: 'observer' as const }

describe('L17 · State + Observer + Command', () => {
  it('los tres juntos resuelven el nivel', () => {
    expect(evaluate(level, { sockets: [command, state, observer] }).metrics).toMatchObject({ delivered: 7, cancelled: 1, invalidAtSink: 0, dropped: 0 })
  })

  it('sin Command, el deshacer se pierde', () => {
    expect(evaluate(level, { sockets: [state, observer] }).metrics.dropped).toBe(1)
  })

  it('sin State, cancelar lo entregado llega como válido', () => {
    expect(evaluate(level, { sockets: [command, observer] }).metrics.invalidAtSink).toBeGreaterThan(0)
  })

  it('sin Observer, Lealtad no se entera', () => {
    expect(evaluate(level, { sockets: [command, state] }).metrics.delivered).toBe(4)
  })
})
