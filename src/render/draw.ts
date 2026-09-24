import { Graphics, Text } from 'pixi.js'
import type { Point, PulseShape } from '../engine'
import { NODE_W } from './layout'
import { FONT_UI, NEON as C } from './theme'

// Pixi continúa el trazo anterior al dibujar un arco: hay que moverse a su inicio primero.
export function arc(d: Graphics, x: number, y: number, r: number, from: number, to: number) {
  return d.moveTo(x + Math.cos(from) * r, y + Math.sin(from) * r).arc(x, y, r, from, to)
}

export function label(text: string, size: number, fill: number, fontFamily = FONT_UI, fontWeight: '400' | '600' | '700' = '600') {
  return new Text({ text, style: { fontFamily, fontSize: size, fontWeight, fill } })
}

// El árbol de if/elsif: una rama por caso más el `else` que pierde pedidos.
export function drawBranchGlyph(d: Graphics, p: Point, cases: number) {
  const x0 = p.x - NODE_W / 2 + 12
  for (let i = 0; i <= cases; i++) {
    const y = p.y - 12 + i * (24 / cases)
    d.moveTo(x0, p.y).lineTo(x0 + 7, y).lineTo(x0 + 12, y).stroke({ width: 1.5, color: i === cases ? C.red : C.amber, alpha: 0.9 })
  }
}

// La forma del pulso dice qué tipo de dato es: ● pedido, ■ pago, ▲ evento, ◆ producto.
export function drawShape(d: Graphics, shape: PulseShape, p: Point, r: number, color: number) {
  if (shape === 'square') d.roundRect(p.x - r, p.y - r, r * 2, r * 2, 2).fill({ color })
  else if (shape === 'triangle') d.poly([p.x, p.y - r * 1.15, p.x + r, p.y + r * 0.8, p.x - r, p.y + r * 0.8]).fill({ color })
  else if (shape === 'diamond') d.poly([p.x, p.y - r * 1.2, p.x + r * 1.2, p.y, p.x, p.y + r * 1.2, p.x - r * 1.2, p.y]).fill({ color })
  else d.circle(p.x, p.y, r * 0.93).fill({ color })
}

export const hexagon = (c: Point, r: number) =>
  Array.from({ length: 6 }, (_, i) => [c.x + r * Math.cos((Math.PI / 3) * i + Math.PI / 6), c.y + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)]).flat()

export function dashed(g: Graphics, a: Point, b: Point, color: number, alpha: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  for (let t = 0; t < len; t += 13) {
    const e = Math.min(t + 7, len)
    g.moveTo(a.x + ux * t, a.y + uy * t).lineTo(a.x + ux * e, a.y + uy * e)
  }
  g.stroke({ width: 3, color, alpha, cap: 'round' })
}
