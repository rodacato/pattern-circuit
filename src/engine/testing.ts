// Constructores de circuitos mínimos para los tests del motor.
import { Circuit, Scenario, type Behavior } from './schema'

export const line = (behaviors: Record<string, Behavior>, extra: Partial<Record<string, { capacity?: number; cost?: number }>> = {}) => {
  const ids = Object.keys(behaviors)
  return Circuit.parse({
    nodes: ids.map((id, i) => ({ id, label: id, at: [i * 2, 0], behavior: behaviors[id], ...extra[id] })),
    wires: ids.slice(1).map((id, i) => ({ from: ids[i], to: id })),
  })
}

export const scenario = (...pulses: { at: number; tags?: string[] }[]) =>
  Scenario.parse({ id: 's', pulses: pulses.map((p) => ({ from: 'src', ...p })) })

