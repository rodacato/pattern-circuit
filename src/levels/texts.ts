import { BREAKER_OPEN, buildCircuit, initialNodeState, reachableVariants, type Level } from '../engine'

// Todos los textos de un nivel que ve el jugador, incluidos los nodos que solo aparecen en algunas variantes.
export function levelTexts(level: Level): string[] {
  const nodes = reachableVariants(level).flatMap((v) => buildCircuit(level, v).circuit.nodes)
  const states = nodes.flatMap((n) => (n.behavior.type === 'machine' ? [n.behavior.initial, ...Object.keys(n.behavior.states), ...Object.values(n.behavior.states).flatMap((s) => Object.values(s).flatMap((t) => (t.to ? [t.to] : [])))] : []))
  const texts = [
    level.title,
    level.brief.problem,
    level.brief.goal,
    ...level.checklist.map((c) => c.text),
    ...nodes.map((n) => n.label),
    ...nodes.flatMap((n) => (n.behavior.type === 'sink' && n.behavior.message ? [n.behavior.message] : [])),
    ...states,
    ...nodes.flatMap((n) => (n.behavior.type === 'breaker' ? [initialNodeState(n.behavior)!, BREAKER_OPEN] : [])),
    ...level.sockets.flatMap((s) => [s.label, ...Object.values(s.options).flatMap((o) => (o ? [o.note.title, o.note.body] : []))]),
    ...level.changeTickets.map((t) => t.text),
    ...level.repairs.map((r) => r.prompt),
    ...level.winWhen.flatMap((a) => (a.label ? [a.label] : [])),
    ...level.scenarios.flatMap((s) => s.pulses.flatMap((p) => (p.label ? [p.label] : []))),
  ]
  return [...new Set(texts.filter(Boolean))]
}
