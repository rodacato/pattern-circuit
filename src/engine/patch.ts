import type { Circuit, GraphPatch, NodeDef, WireDef } from './schema'

export function wireId(w: WireDef): string {
  if (w.id) return w.id
  const port = w.port && w.port !== 'out' ? `.${w.port}` : ''
  const key = w.key ? `[${w.key}]` : ''
  return `${w.from}${port}${key}->${w.to}`
}

// Orden fijo: quitar, actualizar, añadir.
export function applyPatch(circuit: Circuit, patch: GraphPatch): Circuit {
  const removed = new Set(patch.remove ?? [])
  const removedWires = new Set(patch.removeWires ?? [])
  const updates = new Map((patch.update ?? []).map((u) => [u.id, u]))

  const nodes: NodeDef[] = circuit.nodes
    .filter((n) => !removed.has(n.id))
    .map((n) => (updates.has(n.id) ? ({ ...n, ...updates.get(n.id) } as NodeDef) : n))
  const wires = circuit.wires.filter(
    (w) => !removed.has(w.from) && !removed.has(w.to) && !removedWires.has(wireId(w)),
  )

  return {
    nodes: [...nodes, ...(patch.add?.nodes ?? [])],
    wires: [...wires, ...(patch.add?.wires ?? [])],
  }
}

// Registrar un cable abstracto en un slot no cuenta: es justo lo que el patrón hace barato.
export function nodesTouched(before: Circuit, after: Circuit): string[] {
  const afterNodes = new Map(after.nodes.map((n) => [n.id, n]))
  const concreteOut = (c: Circuit, id: string) =>
    c.wires
      .filter((w) => w.from === id && w.dep === 'concrete')
      .map(wireId)
      .sort()
      .join('|')

  return before.nodes
    .filter((n) => {
      const m = afterNodes.get(n.id)
      return !m || stable(n) !== stable(m) || concreteOut(before, n.id) !== concreteOut(after, n.id)
    })
    .map((n) => n.id)
}

export function circuitErrors(c: Circuit): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const n of c.nodes) {
    if (ids.has(n.id)) errors.push(`nodo duplicado: ${n.id}`)
    ids.add(n.id)
  }
  const wireIds = new Set<string>()
  for (const w of c.wires) {
    const id = wireId(w)
    if (wireIds.has(id)) errors.push(`cable duplicado: ${id}`)
    wireIds.add(id)
    if (!ids.has(w.from)) errors.push(`cable ${id}: origen inexistente ${w.from}`)
    if (!ids.has(w.to)) errors.push(`cable ${id}: destino inexistente ${w.to}`)
  }
  return errors
}

function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  )
}
