import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L21 · Null Object', () => {
  it('without a pattern: customers without a card blow up on first use', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 2, dropped: 2 })
  })

  it('Null Object: everyone goes through without changing those who use the card', () => {
    expect(evaluate(level, { sockets: [{ id: 'card', pattern: 'null-object' }] }).metrics).toMatchObject({ delivered: 4, dropped: 0 })
  })
})
