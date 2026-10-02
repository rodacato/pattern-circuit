import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = { id: 'recipe', pattern: 'template-method' as const }

describe('L14 · Template Method', () => {
  it('without a pattern: the tea comes out without a lid', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 4, invalidAtSink: 2 })
  })

  it('without a pattern + sleeve: the same edit in both copies', () => {
    expect(evaluate(level, { ticket: 'sleeve' }).touched.sort()).toEqual(['lidC', 'serveT'])
  })

  it('Template Method: common steps only once', () => {
    expect(evaluate(level, { sockets: [socket] }).metrics.invalidAtSink).toBe(0)
    expect(evaluate(level, { sockets: [socket], ticket: 'sleeve' }).touched).toEqual(['lid'])
  })
})
