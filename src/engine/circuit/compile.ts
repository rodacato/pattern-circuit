import { pathLength, wirePath, type Point } from './geometry'
import { circuitErrors, wireId } from './patch'
import type { Circuit, NodeDef, WireDef } from '../schema'

export type CompiledWire = WireDef & { id: string; path: Point[]; length: number }

export type CompiledCircuit = {
  nodes: Map<string, NodeDef>
  wires: Map<string, CompiledWire>
  outgoing: Map<string, CompiledWire[]>
  incoming: Map<string, number> // cables que llegan a cada nodo (un join espera una parte por cable)
}

export function compile(circuit: Circuit): CompiledCircuit {
  const errors = circuitErrors(circuit)
  if (errors.length) throw new Error(`Circuito inválido:\n${errors.join('\n')}`)

  const nodes = new Map(circuit.nodes.map((n) => [n.id, n]))
  const wires = new Map<string, CompiledWire>()
  const outgoing = new Map<string, CompiledWire[]>(circuit.nodes.map((n) => [n.id, []]))
  const incoming = new Map<string, number>()

  for (const w of circuit.wires) {
    const path = wirePath(nodes.get(w.from)!.at, nodes.get(w.to)!.at)
    const compiled = { ...w, id: wireId(w), path, length: pathLength(path) }
    wires.set(compiled.id, compiled)
    outgoing.get(w.from)!.push(compiled)
    incoming.set(w.to, (incoming.get(w.to) ?? 0) + 1)
  }
  return { nodes, wires, outgoing, incoming }
}
