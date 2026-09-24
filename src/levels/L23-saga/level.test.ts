import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'saga' | 'command' | 'observer') => ({ socket: { id: 'pasos', pattern } })

describe('L23 · Saga', () => {
  it('sin patrón: el cliente sin avena pagó y se quedó sin nada', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('Saga: el fallo compensa el cobro con un reembolso', () => {
    expect(evaluate(level, socket('saga')).metrics).toMatchObject({ delivered: 4, dropped: 0, invalidAtSink: 0 })
  })

  it('Observer avisa pero no reembolsa', () => {
    expect(evaluate(level, socket('observer')).metrics.invalidAtSink).toBe(1)
  })
})
