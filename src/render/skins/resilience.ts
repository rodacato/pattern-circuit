// Skins of the Resilience chapter (Null Object, Circuit Breaker, Saga), with their own color.
import { BREAKER_OPEN } from '../../engine'
import { N } from '../../i18n'
import { NEON as C } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import type { Skin } from './types'

const PINK = 0xff5fd2

// Null Object: the object that "does nothing" is drawn hollow, and the pulses carrying it, with a dotted ring.
export function nullObject(): Skin {
  return {
    drawNode({ d }, _node, at) {
      d.circle(at.x + NODE_W / 2 - 12, at.y - NODE_H / 2 + 10, 5).stroke({ width: 1.5, color: C.violet })
      d.moveTo(at.x + NODE_W / 2 - 16, at.y - NODE_H / 2 + 14).lineTo(at.x + NODE_W / 2 - 8, at.y - NODE_H / 2 + 6).stroke({ width: 1.5, color: C.violet })
    },
    drawPulse({ d }, pulse, pos) {
      if (!pulse.tags.includes('card:null')) return
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i
        d.circle(pos.x + Math.cos(a) * 11, pos.y + Math.sin(a) * 11, 1.2).fill({ color: C.violet })
      }
    },
  }
}

// Circuit Breaker: a switch that looks closed (passes) or open (diverts).
export function circuitBreaker(): Skin {
  return {
    drawNode({ d, gl, state }, node, at) {
      const open = state.nodeState[node.id] === BREAKER_OPEN
      const y = at.y - NODE_H / 2 - 12
      d.circle(at.x - 12, y, 3).fill({ color: PINK })
      d.circle(at.x + 12, y, 3).fill({ color: PINK })
      const end = open ? { x: at.x + 8, y: y - 10 } : { x: at.x + 12, y }
      d.moveTo(at.x - 12, y).lineTo(end.x, end.y).stroke({ width: 2.5, color: open ? C.red : C.green })
      gl.moveTo(at.x - 12, y).lineTo(end.x, end.y).stroke({ width: 6, color: open ? C.red : C.green, alpha: 0.5 })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'node.state' && e.state === BREAKER_OPEN) {
        fx.ring(at, C.red, 90)
        fx.float(at, N('render.skin.resilience.breakerOpen'), C.red)
      }
    },
  }
}

// Saga: the steps carry their compensation; the compensation runs backwards.
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
      if (node.behavior.type === 'transform' && e.type === 'pulse.transform') fx.float(at, N('render.skin.resilience.compensated'), PINK)
    },
  }
}
