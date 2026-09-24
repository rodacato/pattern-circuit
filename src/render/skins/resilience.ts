import { NEON as C } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import type { Skin } from './types'

const PINK = 0xff5fd2

// Null Object: el objeto que "no hace nada" se dibuja hueco, y los pulsos que lo llevan, con anillo punteado.
export function nullObject(): Skin {
  return {
    drawNode({ d }, _node, at) {
      d.circle(at.x + NODE_W / 2 - 12, at.y - NODE_H / 2 + 10, 5).stroke({ width: 1.5, color: C.violet })
      d.moveTo(at.x + NODE_W / 2 - 16, at.y - NODE_H / 2 + 14).lineTo(at.x + NODE_W / 2 - 8, at.y - NODE_H / 2 + 6).stroke({ width: 1.5, color: C.violet })
    },
    drawPulse({ d }, pulse, pos) {
      if (!pulse.tags.includes('tarjeta:nula')) return
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i
        d.circle(pos.x + Math.cos(a) * 11, pos.y + Math.sin(a) * 11, 1.2).fill({ color: C.violet })
      }
    },
  }
}

// Circuit Breaker: un interruptor que se ve cerrado (pasa) o abierto (desvía).
export function circuitBreaker(): Skin {
  return {
    drawNode({ d, gl, state }, node, at) {
      const open = state.nodeState[node.id] === 'abierto'
      const y = at.y - NODE_H / 2 - 12
      d.circle(at.x - 12, y, 3).fill({ color: PINK })
      d.circle(at.x + 12, y, 3).fill({ color: PINK })
      const end = open ? { x: at.x + 8, y: y - 10 } : { x: at.x + 12, y }
      d.moveTo(at.x - 12, y).lineTo(end.x, end.y).stroke({ width: 2.5, color: open ? C.red : C.green })
      gl.moveTo(at.x - 12, y).lineTo(end.x, end.y).stroke({ width: 6, color: open ? C.red : C.green, alpha: 0.5 })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'node.state' && e.state === 'abierto') {
        fx.ring(at, C.red, 90)
        fx.float(at, '⚡ interruptor abierto: directo al respaldo', C.red)
      }
    },
  }
}

// Saga: los pasos llevan su compensación; la compensación corre hacia atrás.
export function saga(): Skin {
  return {
    drawNode({ d }, node, at) {
      const back = node.behavior.type === 'transform'
      const y = at.y + NODE_H / 2 + 8
      const [from, to] = back ? [at.x + 14, at.x - 14] : [at.x - 14, at.x + 14]
      d.moveTo(from, y).lineTo(to, y).stroke({ width: 1.5, color: PINK })
      d.moveTo(to, y).lineTo(to + (back ? 5 : -5), y - 4).moveTo(to, y).lineTo(to + (back ? 5 : -5), y + 4).stroke({ width: 1.5, color: PINK })
    },
    onEvent({ fx }, node, at, e) {
      if (node.behavior.type === 'transform' && e.type === 'pulse.transform') fx.float(at, '↩ compensado', PINK)
    },
  }
}
