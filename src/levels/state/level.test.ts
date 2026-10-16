import { describe, expect, it } from 'vitest'
import { createSim, evaluate, runToEnd, buildCircuit, scenarioFor } from '../../engine'
import level from './level'

const socket = (pattern: 'state' | 'strategy' | 'command') => ({ sockets: [{ id: 'states', pattern }] })

describe('L11 · State', () => {
  it('without a pattern: three out-of-order events reach the history', () => {
    expect(evaluate(level, {}).metrics.invalidAtSink).toBe(3)
  })

  it('State rejects what does not apply and the order ends up delivered', () => {
    const variant = socket('state')
    expect(evaluate(level, variant).metrics).toMatchObject({ invalidAtSink: 0, dropped: 0 })
    const { sim } = runToEnd(createSim(buildCircuit(level, variant).circuit, scenarioFor(level, variant)))
    expect(sim.state.nodeState.order).toBe('delivered')
  })

  it.each(['strategy', 'command'] as const)('%s lets out-of-order events through', (p) => {
    expect(evaluate(level, socket(p)).metrics.invalidAtSink).toBe(3)
  })
})
