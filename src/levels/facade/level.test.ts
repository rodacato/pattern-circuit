import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = { id: 'kitchen', pattern: 'facade' as const }

describe('L08 · Facade', () => {
  it('without a pattern: the app lattes come out without foam', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 4, invalidAtSink: 2 })
  })

  it('without a pattern + preheat: the same change in two places', () => {
    expect(evaluate(level, { ticket: 'preheat' }).touched.sort()).toEqual(['grinder', 'grinderApp'])
  })

  it('Facade: a single orchestration, a single place to change', () => {
    expect(evaluate(level, { sockets: [socket] }).metrics.invalidAtSink).toBe(0)
    expect(evaluate(level, { sockets: [socket], ticket: 'preheat' }).touched).toEqual(['grinder'])
  })
})
