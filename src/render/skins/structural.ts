import { NEON as C } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import type { Skin } from './types'

// Decorator: anillos alrededor del nodo que envuelve y alrededor de cada pulso envuelto.
export function decorator(): Skin {
  return {
    drawNode({ d, gl }, _node, at) {
      for (let i = 1; i <= 2; i++) d.roundRect(at.x - NODE_W / 2 - i * 5, at.y - NODE_H / 2 - i * 5, NODE_W + i * 10, NODE_H + i * 10, 12 + i * 5).stroke({ width: 1.2, color: C.cyan, alpha: 0.5 / i })
      gl.roundRect(at.x - NODE_W / 2 - 8, at.y - NODE_H / 2 - 8, NODE_W + 16, NODE_H + 16, 18).stroke({ width: 3, color: C.cyan, alpha: 0.25 })
    },
    drawPulse({ d, gl }, _pulse, pos) {
      d.circle(pos.x, pos.y, 11).stroke({ width: 1.5, color: C.cyan, alpha: 0.9 })
      gl.circle(pos.x, pos.y, 12).stroke({ width: 4, color: C.cyan, alpha: 0.5 })
    },
  }
}

// Adapter: un conector que recibe una forma (■) y entrega otra (◆).
export function adapter(): Skin {
  return {
    drawNode({ d, gl }, _node, at) {
      const y = at.y + NODE_H / 2 + 9
      d.rect(at.x - 16, y - 4, 8, 8).fill({ color: C.muted })
      d.moveTo(at.x - 6, y).lineTo(at.x + 5, y).stroke({ width: 1.5, color: C.cyan })
      d.poly([at.x + 12, y - 5, at.x + 17, y, at.x + 12, y + 5, at.x + 7, y]).fill({ color: C.cyan })
      gl.poly([at.x + 12, y - 5, at.x + 17, y, at.x + 12, y + 5, at.x + 7, y]).fill({ color: C.cyan, alpha: 0.6 })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'pulse.transform') fx.ring(at, C.cyan, 40)
    },
  }
}

// Facade: la puerta es un panel ancho; lo que queda detrás se ve apagado.
export function facade(): Skin {
  return {
    drawNode({ d, gl, circuit }, node, at) {
      const behind = [...circuit.wires.values()].some((w) => w.to === node.id && circuit.nodes.get(w.from)?.skin === 'facade')
      if (behind) {
        d.roundRect(at.x - NODE_W / 2, at.y - NODE_H / 2, NODE_W, NODE_H, 12).fill({ color: C.bg, alpha: 0.45 })
        return
      }
      d.roundRect(at.x - NODE_W / 2 - 6, at.y - NODE_H / 2 - 14, NODE_W + 12, NODE_H + 28, 14).stroke({ width: 2, color: C.cyan, alpha: 0.7 })
      gl.roundRect(at.x - NODE_W / 2 - 6, at.y - NODE_H / 2 - 14, NODE_W + 12, NODE_H + 28, 14).stroke({ width: 6, color: C.cyan, alpha: 0.3 })
    },
  }
}

// Proxy: un gemelo translúcido delante del real; los aciertos rebotan aquí.
export function proxy(): Skin {
  return {
    drawNode({ d, gl, state }, node, at) {
      d.roundRect(at.x - NODE_W / 2 + 8, at.y - NODE_H / 2 - 8, NODE_W, NODE_H, 12).stroke({ width: 1.5, color: C.cyan, alpha: 0.35 })
      const keys = state.cacheKeys[node.id] ?? []
      keys.forEach((_, i) => {
        d.roundRect(at.x - NODE_W / 2 + 8 + i * 12, at.y + NODE_H / 2 + 6, 9, 6, 2).fill({ color: C.cyan })
        gl.roundRect(at.x - NODE_W / 2 + 8 + i * 12, at.y + NODE_H / 2 + 6, 9, 6, 2).fill({ color: C.cyan, alpha: 0.5 })
      })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type !== 'pulse.cache') return
      fx.ring(at, e.hit ? C.green : C.amber, e.hit ? 60 : 30)
      if (e.hit) fx.float(at, '↩ desde el proxy', C.green)
    },
  }
}

// Composite: las hojas llevan un punto; los grupos, un árbol que se abre.
export function composite(): Skin {
  return {
    drawNode({ d }, node, at) {
      const top = at.y - NODE_H / 2 - 10
      if (node.behavior.type === 'broadcast') {
        d.moveTo(at.x, top - 6).lineTo(at.x, top).moveTo(at.x - 10, top + 5).lineTo(at.x, top).lineTo(at.x + 10, top + 5).stroke({ width: 1.5, color: C.cyan })
        for (const dx of [-10, 0, 10]) d.circle(at.x + dx, dx === 0 ? top - 6 : top + 5, 2.5).fill({ color: C.cyan })
      } else if (node.behavior.type === 'join') {
        d.moveTo(at.x - 10, top - 5).lineTo(at.x, top).lineTo(at.x + 10, top - 5).moveTo(at.x, top).lineTo(at.x, top + 6).stroke({ width: 1.5, color: C.cyan })
      } else {
        d.circle(at.x, top, 3.5).fill({ color: C.cyan })
      }
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'pulse.merge') fx.burst(at, C.cyan, 10, 1.4)
    },
  }
}
