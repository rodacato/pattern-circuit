import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const factory = { id: 'create-drink', pattern: 'factory-method' as const }
const strategy = { id: 'payment-method', pattern: 'strategy' as const }

describe('L15 · Factory Method + Strategy', () => {
  it('without patterns: wrong drink and lost voucher', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ invalidAtSink: 1, dropped: 1 })
  })

  it('each pattern fixes only its own variation point', () => {
    expect(evaluate(level, { sockets: [factory] }).metrics).toMatchObject({ invalidAtSink: 0, dropped: 1 })
    expect(evaluate(level, { sockets: [strategy] }).metrics).toMatchObject({ invalidAtSink: 2, dropped: 0 }) // both Montaña orders arrive, with latte
  })

  it('together they solve the level', () => {
    expect(evaluate(level, { sockets: [factory, strategy] }).won).toBe(true)
  })
})
