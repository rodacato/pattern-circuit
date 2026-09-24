import { NEON as C } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import type { Skin } from './types'

// Ports & Adapters: el núcleo es un hexágono; los puertos, muescas; los adaptadores, enchufes por fuera.
export function portsAndAdapters(): Skin {
  return {
    drawNode({ d, gl, circuit }, node, at) {
      const isPort = node.behavior.type === 'slot'
      const isCore = !isPort && [...circuit.wires.values()].some((w) => w.from === node.id && circuit.nodes.get(w.to)?.behavior.type === 'slot')
      if (isCore) {
        const r = NODE_W / 2 + 16
        const hex = Array.from({ length: 6 }, (_, i) => [at.x + r * Math.cos((Math.PI / 3) * i), at.y + r * 0.72 * Math.sin((Math.PI / 3) * i)]).flat()
        d.poly(hex).stroke({ width: 2, color: C.green, alpha: 0.8 })
        gl.poly(hex).stroke({ width: 6, color: C.green, alpha: 0.35 })
      } else if (isPort) {
        d.poly([at.x - 8, at.y - NODE_H / 2 - 4, at.x + 8, at.y - NODE_H / 2 - 4, at.x + 4, at.y - NODE_H / 2 + 4, at.x - 4, at.y - NODE_H / 2 + 4]).fill({ color: C.green })
      } else {
        d.rect(at.x - NODE_W / 2 - 6, at.y - 5, 6, 10).fill({ color: C.green })
        d.rect(at.x - NODE_W / 2 - 10, at.y - 3, 4, 2).fill({ color: C.green })
        d.rect(at.x - NODE_W / 2 - 10, at.y + 1, 4, 2).fill({ color: C.green })
      }
    },
  }
}

// Event Bus: el bus es una vía luminosa por la que corren los eventos.
export function eventBus(): Skin {
  return {
    drawNode({ d, gl, time }, node, at) {
      if (node.behavior.type !== 'broadcast') {
        d.circle(at.x + NODE_W / 2 - 10, at.y - NODE_H / 2 + 9, 3).fill({ color: C.green })
        return
      }
      const w = NODE_W + 40
      d.roundRect(at.x - w / 2, at.y + NODE_H / 2 + 6, w, 6, 3).fill({ color: C.green, alpha: 0.4 })
      gl.roundRect(at.x - w / 2, at.y + NODE_H / 2 + 6, w, 6, 3).fill({ color: C.green, alpha: 0.5 })
      const dot = ((time / 8) % w) - w / 2
      d.circle(at.x + dot, at.y + NODE_H / 2 + 9, 3).fill({ color: C.white })
    },
    onEvent({ fx }, node, at, e) {
      if (node.behavior.type === 'broadcast' && e.type === 'pulse.exit') fx.ring(at, C.green, 70)
    },
  }
}

// CQRS: el lado de escritura en ámbar, el de lectura en cian; la proyección los une.
export function cqrs(): Skin {
  return {
    drawNode({ d, gl }, node, at) {
      const read = /Query|View/.test(node.className ?? '')
      const color = node.behavior.type === 'broadcast' ? C.green : read ? C.cyan : C.amber
      d.roundRect(at.x - NODE_W / 2 + 6, at.y - NODE_H / 2 + 4, NODE_W - 12, 4, 2).fill({ color })
      gl.roundRect(at.x - NODE_W / 2 + 6, at.y - NODE_H / 2 + 4, NODE_W - 12, 4, 2).fill({ color, alpha: 0.6 })
    },
  }
}
