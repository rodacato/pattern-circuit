import type { Graphics } from 'pixi.js'

// Pixi continúa el trazo anterior al dibujar un arco: hay que moverse a su inicio primero.
export function arc(d: Graphics, x: number, y: number, r: number, from: number, to: number) {
  return d.moveTo(x + Math.cos(from) * r, y + Math.sin(from) * r).arc(x, y, r, from, to)
}
