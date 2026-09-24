import { describe, expect, it } from 'vitest'
import { Circuit, compile, type Pulse } from '../engine'
import { CELL, circuitBounds, fitWorld, nearestPulse, NODE_W, nodeAt, pulsePosition, socketCenter, withinSocket, worldTransform, zoomAt, ZOOM_LIMITS } from './layout'

const circuit = compile(
  Circuit.parse({
    nodes: [
      { id: 'a', label: 'A', at: [0, 0], behavior: { type: 'source' } },
      { id: 'b', label: 'B', at: [4, 2], behavior: { type: 'sink' } },
    ],
    wires: [{ from: 'a', to: 'b' }],
  }),
)

const pulse = (loc: Pulse['loc']): Pulse => ({ id: 1, originId: 1, shape: 'circle', tags: [], data: {}, loc, status: 'alive', trail: [] })

describe('layout', () => {
  it('mide el circuito en píxeles', () => {
    expect(circuitBounds(circuit.nodes.values())).toEqual({ w: 4 * CELL, h: 2 * CELL })
  })

  it('deja libres las franjas de tarjetas y controles', () => {
    const fit = fitWorld({ width: 2000, height: 800 }, { w: 1000, h: 100 }, { top: 200, bottom: 100 })
    expect(fit.y).toBeGreaterThanOrEqual(200)
    expect(fit.y + 100 * fit.zoom).toBeLessThanOrEqual(700)
  })

  it('centra el circuito y limita el zoom', () => {
    const fit = fitWorld({ width: 10_000, height: 10_000 }, { w: 100, h: 100 })
    expect(fit.zoom).toBe(1.7)
    expect(fit.x).toBe(Math.round((10_000 - 170) / 2))
  })

  it('encuentra el nodo bajo el puntero', () => {
    expect(nodeAt(circuit.nodes.values(), { x: 4 * CELL + NODE_W / 2 - 1, y: 2 * CELL })?.id).toBe('b')
    expect(nodeAt(circuit.nodes.values(), { x: 2 * CELL, y: 1 * CELL })).toBeUndefined()
  })

  it('elige el pulso más cercano dentro del radio', () => {
    const positions = new Map([
      [1, { x: 0, y: 0 }],
      [2, { x: 10, y: 0 }],
    ])
    expect(nearestPulse(positions, { x: 8, y: 0 })).toBe(2)
    expect(nearestPulse(positions, { x: 100, y: 0 })).toBeUndefined()
  })

  it('interpola la posición del pulso entre dos ticks del mismo cable', () => {
    const wireId = [...circuit.wires.keys()][0]
    const before = pulse({ kind: 'wire', wireId, progress: 0 })
    const now = pulse({ kind: 'wire', wireId, progress: 0.5 })
    const halfway = pulsePosition(circuit, now, before, 0.5, 0)
    const end = pulsePosition(circuit, now, before, 1, 0)
    expect(halfway.x + halfway.y).toBeLessThan(end.x + end.y)
    expect(pulsePosition(circuit, now, undefined, 0.5, 0)).toEqual(end)
  })

  it('coloca el socket sobre su nodo del circuito base y acepta soltar cerca', () => {
    const base = [...circuit.nodes.values()]
    const at = socketCenter(base, 'b')!
    expect(at.x).toBe(4 * CELL)
    expect(at.y).toBeLessThan(2 * CELL)
    expect(withinSocket(at, { x: at.x + 20, y: at.y })).toBe(true)
    expect(withinSocket(at, { x: at.x + 200, y: at.y })).toBe(false)
    expect(socketCenter(base, 'nope')).toBeUndefined()
  })

  it('el zoom mantiene fijo el punto bajo el puntero y respeta los límites', () => {
    const screen = { width: 800, height: 600 }
    const bounds = { w: 600, h: 300 }
    const view = { zoom: 1, x: 0, y: 0 }
    const pointer = { x: 300, y: 200 }
    const t0 = worldTransform(screen, bounds, view)
    const world = { x: (pointer.x - t0.x) / t0.scale, y: (pointer.y - t0.y) / t0.scale }
    const zoomed = zoomAt(screen, bounds, view, pointer, 2)
    const t1 = worldTransform(screen, bounds, zoomed)
    expect(zoomed.zoom).toBe(2)
    expect(world.x * t1.scale + t1.x).toBeCloseTo(pointer.x, 0)
    expect(world.y * t1.scale + t1.y).toBeCloseTo(pointer.y, 0)
    expect(zoomAt(screen, bounds, view, pointer, 100).zoom).toBe(ZOOM_LIMITS[1])
  })
})
