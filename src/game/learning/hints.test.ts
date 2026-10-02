import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import { LEVELS } from '../../levels'
import { initialFlow } from '../flow/levelFlow'
import { identity } from '../../i18n'
import { hintLadder as ladder } from './hints'

const hintLadder = (...args: Parameters<typeof ladder>) => ladder(...args).map(identity)

const level = (id: string) => LEVELS.find((l) => l.id === id)!

describe('hints', () => {
  it('go from a guiding question to the answer, through the family and a ruling out', () => {
    const l = level('strategy')
    const hints = hintLadder(l, { ...initialFlow(), stage: 'choose' }, evaluate(l, {}))
    expect(hints).toHaveLength(4)
    expect(hints[0]).toContain('se pierden pedidos')
    expect(hints[1]).toContain('comportamiento')
    expect(hints[2]).toMatch(/^Descarta (Observer|Decorator)/)
    expect(hints[3]).toBe('Prueba con Strategy.')
  })

  it('with several sockets they point at the first unresolved one and name it', () => {
    const l = level('branches-and-payments')
    const [first, second] = l.sockets
    const solved = first.inventory.find((p) => first.options[p]?.outcome === 'solves')!
    const flow = { ...initialFlow(), stage: 'choose' as const, plugs: { [first.id]: { socketId: first.id, pattern: solved, outcome: 'solves' as const } } }
    expect(hintLadder(l, flow).at(-1)).toContain(`socket "${second.label}"`)
  })

  it('every level with sockets has at least a question, a family and an answer', () => {
    for (const l of LEVELS.filter((x) => x.sockets.length)) expect(hintLadder(l, { ...initialFlow(), stage: 'choose' }).length, l.id).toBeGreaterThanOrEqual(3)
  })
})
