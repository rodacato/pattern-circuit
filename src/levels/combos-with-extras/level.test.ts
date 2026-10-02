import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const composite = { id: 'combo', pattern: 'composite' as const }
const decorator = { id: 'extras', pattern: 'decorator' as const }

describe('L16 · Composite + Decorator', () => {
  it('without patterns: no breakfast arrives', () => {
    expect(evaluate(level, {}).metrics.delivered).toBe(1)
  })

  it('Composite only: the breakfasts arrive, but the two-extras one comes out incomplete', () => {
    expect(evaluate(level, { sockets: [composite] }).metrics).toMatchObject({ delivered: 3, invalidAtSink: 1 })
  })

  it('together: all the extras applied inside the combo', () => {
    expect(evaluate(level, { sockets: [composite, decorator] }).metrics).toMatchObject({ delivered: 3, invalidAtSink: 0, dropped: 0 })
  })
})
