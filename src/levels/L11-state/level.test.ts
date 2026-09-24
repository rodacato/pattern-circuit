import { describe, expect, it } from 'vitest'
import { createSim, evaluate, runToEnd, buildCircuit, scenarioFor } from '../../engine'
import level from './level'

const socket = (pattern: 'state' | 'strategy' | 'command') => ({ socket: { id: 'estados', pattern } })

describe('L11 · State', () => {
  it('sin patrón: tres eventos fuera de orden llegan al historial', () => {
    expect(evaluate(level, {}).metrics.invalidAtSink).toBe(3)
  })

  it('State rechaza lo que no aplica y el pedido termina entregado', () => {
    const variant = socket('state')
    expect(evaluate(level, variant).metrics).toMatchObject({ invalidAtSink: 0, dropped: 0 })
    const { sim } = runToEnd(createSim(buildCircuit(level, variant).circuit, scenarioFor(level, variant)))
    expect(sim.state.nodeState.pedido).toBe('entregado')
  })

  it.each(['strategy', 'command'] as const)('%s deja pasar los eventos fuera de orden', (p) => {
    expect(evaluate(level, socket(p)).metrics.invalidAtSink).toBe(3)
  })
})
