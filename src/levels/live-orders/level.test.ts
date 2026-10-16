import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const command = { id: 'events', pattern: 'command' as const }
const state = { id: 'states', pattern: 'state' as const }
const observer = { id: 'notices', pattern: 'observer' as const }

describe('L17 · State + Observer + Command', () => {
  it('all three together solve the level', () => {
    expect(evaluate(level, { sockets: [command, state, observer] }).metrics).toMatchObject({ delivered: 7, cancelled: 1, invalidAtSink: 0, dropped: 0 })
  })

  it('without Command, the undo is lost', () => {
    expect(evaluate(level, { sockets: [state, observer] }).metrics.dropped).toBe(1)
  })

  it('without State, cancelling the delivered arrives as valid', () => {
    expect(evaluate(level, { sockets: [command, observer] }).metrics.invalidAtSink).toBe(2)
  })

  it('without Observer, Loyalty does not find out', () => {
    expect(evaluate(level, { sockets: [command, state] }).metrics.delivered).toBe(4)
  })
})
