import { NEON as C } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import { arc } from './draw'
import type { Skin } from './types'

// Factory Method: cada creador es una prensa con molde que baja al estampar el producto.
export function factoryMethod(): Skin {
  const stamps = new Map<string, number>()
  return {
    drawNode({ d, gl }, node, at) {
      if (node.behavior.type === 'slot') return
      const t = stamps.get(node.id) ?? 0
      const drop = Math.sin(Math.min(1, t) * Math.PI) * 8
      const top = at.y - NODE_H / 2 - 16 + drop
      d.rect(at.x - 1.5, at.y - NODE_H / 2 - 22, 3, 8 + drop).fill({ color: C.muted })
      d.roundRect(at.x - 14, top, 28, 9, 2).fill({ color: C.panel }).stroke({ width: 1.5, color: C.amber })
      if (t > 0) {
        gl.roundRect(at.x - 14, top, 28, 9, 2).fill({ color: C.amber, alpha: t * 0.8 })
        stamps.set(node.id, t - 0.04)
      }
    },
    onEvent({ fx }, node, at, e) {
      if (node.behavior.type === 'slot') return
      if (e.type === 'pulse.enter') stamps.set(node.id, 1)
      if (e.type === 'pulse.exit') fx.burst(at, C.amber, 12, 1.8)
    },
  }
}

// Builder: estaciones de una cinta; el pulso recoge una ficha por estación que orbita a su alrededor.
export function builder(): Skin {
  return {
    drawNode({ d }, _node, at) {
      for (let i = 0; i < 3; i++) {
        const x = at.x - 10 + i * 10
        const y = at.y + NODE_H / 2 + 6
        d.moveTo(x - 3, y - 3).lineTo(x, y).lineTo(x - 3, y + 3).stroke({ width: 1.5, color: C.amber, alpha: 0.7 })
      }
    },
    drawPulse({ d, gl, time }, _pulse, pos, visited) {
      const n = visited.length
      for (let i = 0; i < n; i++) {
        const a = time / 400 + (Math.PI * 2 * i) / n
        const x = pos.x + Math.cos(a) * 13
        const y = pos.y + Math.sin(a) * 13
        d.rect(x - 2.5, y - 2.5, 5, 5).fill({ color: C.amber })
        gl.circle(x, y, 4).fill({ color: C.amber, alpha: 0.6 })
      }
    },
  }
}

// Singleton: halo con candado; todos comparten la misma instancia.
export function singleton(): Skin {
  return {
    drawNode({ d, gl, time }, _node, at) {
      const r = NODE_W / 2 + 10 + Math.sin(time / 400) * 2
      d.circle(at.x, at.y, r).stroke({ width: 1, color: C.amber, alpha: 0.45 })
      gl.circle(at.x, at.y, r).stroke({ width: 4, color: C.amber, alpha: 0.2 })
      const lx = at.x + NODE_W / 2 - 14
      const ly = at.y - NODE_H / 2 + 8
      arc(d, lx, ly, 3.5, Math.PI, Math.PI * 2).stroke({ width: 1.5, color: C.amber })
      d.roundRect(lx - 5, ly, 10, 7, 1.5).fill({ color: C.amber })
    },
  }
}
