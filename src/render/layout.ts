// Geometría de pantalla sin Pixi: todo lo que el render calcula y se puede probar aislado.
import { pointAt, type CompiledCircuit, type NodeDef, type Point, type Pulse } from '../engine'

export const CELL = 62
export const NODE_W = 112
export const NODE_H = 50

export const toPx = (p: Point): Point => ({ x: p.x * CELL, y: p.y * CELL })
export const nodeCenter = (n: NodeDef): Point => toPx({ x: n.at[0], y: n.at[1] })
export const outPort = (n: NodeDef): Point => ({ x: nodeCenter(n).x + NODE_W / 2, y: nodeCenter(n).y })

export function circuitBounds(nodes: Iterable<NodeDef>): { w: number; h: number } {
  const list = [...nodes]
  return {
    w: Math.max(0, ...list.map((n) => n.at[0])) * CELL,
    h: Math.max(0, ...list.map((n) => n.at[1])) * CELL,
  }
}

// Escala y centra el circuito dejando margen para las tarjetas flotantes; nunca amplía de más.
export function fitWorld(screen: { width: number; height: number }, bounds: { w: number; h: number }) {
  const zoom = Math.min(screen.width / (bounds.w + CELL * 3.6), screen.height / (bounds.h + CELL * 3.4), 1.7)
  return {
    zoom,
    x: Math.round((screen.width - bounds.w * zoom) / 2),
    y: Math.round((screen.height - bounds.h * zoom) / 2),
  }
}

export function nodeAt(nodes: Iterable<NodeDef>, p: Point): NodeDef | undefined {
  for (const n of nodes) {
    const c = nodeCenter(n)
    if (Math.abs(p.x - c.x) <= NODE_W / 2 && Math.abs(p.y - c.y) <= NODE_H / 2) return n
  }
  return undefined
}

export function nearestPulse(positions: Map<number, Point>, p: Point, radius = 18): number | undefined {
  let best: { id: number; d: number } | undefined
  for (const [id, q] of positions) {
    const d = Math.hypot(q.x - p.x, q.y - p.y)
    if (d <= radius && (!best || d < best.d)) best = { id, d }
  }
  return best?.id
}

// En un cable interpola entre el tick anterior y el actual; dentro de un nodo, los pulsos se alinean arriba.
export function pulsePosition(circuit: CompiledCircuit, pulse: Pulse, before: Pulse | undefined, alpha: number, slot: number): Point {
  if (pulse.loc.kind === 'wire') {
    const wire = circuit.wires.get(pulse.loc.wireId)!
    const from = before?.loc.kind === 'wire' && before.loc.wireId === pulse.loc.wireId ? before.loc.progress : pulse.loc.progress
    return toPx(pointAt(wire.path, from + (pulse.loc.progress - from) * alpha))
  }
  const c = nodeCenter(circuit.nodes.get(pulse.loc.nodeId)!)
  return { x: c.x - NODE_W / 2 + 16 + slot * 16, y: c.y - NODE_H / 2 }
}

export const SOCKET_R = 13

// El socket vive sobre el nodo del circuito base: no se mueve aunque el patrón reemplace ese nodo.
export function socketCenter(baseNodes: NodeDef[], nodeId: string): Point | undefined {
  const n = baseNodes.find((b) => b.id === nodeId)
  if (!n) return undefined
  const c = nodeCenter(n)
  return { x: c.x, y: c.y - NODE_H / 2 - 22 }
}

export const withinSocket = (socket: Point, p: Point, slack = 26) => Math.hypot(p.x - socket.x, p.y - socket.y) <= SOCKET_R + slack
