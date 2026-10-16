import { BREAKER_OPEN, buildCircuit, initialNodeState, reachableVariants, stateTextKey, type Level } from '../engine'

// Every catalog key a level needs to be shown: the fields of the data (already qualified by defineLevel), the
// labels of the nodes of every reachable variant, and the text of each machine or breaker state.
export function levelTextKeys(level: Level): string[] {
  const nodes = reachableVariants(level).flatMap((v) => buildCircuit(level, v).circuit.nodes)
  const states = nodes.flatMap((n) => {
    const b = n.behavior
    if (b.type === 'breaker') return [initialNodeState(b)!, BREAKER_OPEN]
    if (b.type !== 'machine') return []
    return [b.initial, ...Object.keys(b.states), ...Object.values(b.states).flatMap((s) => Object.values(s).flatMap((t) => (t.to ? [t.to] : [])))]
  })
  const keys = [
    level.title,
    level.brief.problem,
    level.brief.goal,
    ...level.checklist.map((c) => c.text),
    ...nodes.map((n) => n.label),
    ...nodes.flatMap((n) => (n.behavior.type === 'sink' && n.behavior.message ? [n.behavior.message] : [])),
    ...states.map((s) => stateTextKey(level.id, s)),
    ...level.sockets.flatMap((s) => [s.label, ...Object.values(s.options).flatMap((o) => (o ? [o.note.title, o.note.body] : []))]),
    ...level.changeTickets.map((t) => t.text),
    ...level.repairs.map((r) => r.prompt),
    ...level.winWhen.flatMap((a) => (a.label !== undefined ? [a.label] : [])),
    ...level.scenarios.flatMap((s) => s.pulses.flatMap((p) => (p.label ? [p.label] : []))),
  ]
  return [...new Set(keys.filter(Boolean))]
}
