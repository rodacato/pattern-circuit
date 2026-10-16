import { NEON as C, pulseColor } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import { N } from '../../i18n'
import { arc } from '../draw'
import type { Skin } from './types'

// Strategy: the context node has a slot; each concrete strategy is a cartridge with a violet stripe.
export function strategy(): Skin {
  const active = new Map<string, { color: number; t: number }>()
  return {
    drawNode({ d, gl }, node, at) {
      if (node.behavior.type !== 'slot') {
        d.roundRect(at.x - NODE_W / 2 + 6, at.y - NODE_H / 2 + 4, NODE_W - 12, 4, 2).fill({ color: C.violet, alpha: 0.9 })
        return
      }
      const slot = { x: at.x + NODE_W / 2 - 22, y: at.y - 12, w: 12, h: 24 }
      d.roundRect(slot.x, slot.y, slot.w, slot.h, 3).stroke({ width: 1.5, color: C.violet, alpha: 0.8 })
      const a = active.get(node.id)
      if (!a) return
      const inset = (1 - Math.min(1, a.t * 1.5)) * slot.h
      d.roundRect(slot.x + 2, slot.y + 2 + inset * 0.3, slot.w - 4, slot.h - 4, 2).fill({ color: a.color, alpha: 0.9 })
      gl.roundRect(slot.x, slot.y, slot.w, slot.h, 3).fill({ color: a.color, alpha: a.t * 0.6 })
      if ((a.t -= 0.02) <= 0) active.delete(node.id)
    },
    onEvent({ fx, pulse }, node, at, e) {
      if (e.type !== 'pulse.branch' || node.behavior.type !== 'slot' || !pulse) return
      const color = pulseColor(pulse.tags)
      active.set(node.id, { color, t: 1 })
      fx.ring({ x: at.x + NODE_W / 2 - 16, y: at.y }, color, 34)
    },
  }
}

// Observer: the subject emits a wave for each notification; subscribers carry "antennas".
export function observer(): Skin {
  return {
    drawNode({ d }, node, at) {
      if (node.behavior.type === 'broadcast') return
      for (let i = 1; i <= 2; i++) arc(d, at.x, at.y - NODE_H / 2, 5 * i, Math.PI * 1.2, Math.PI * 1.8).stroke({ width: 1.5, color: C.amber, alpha: 0.7 })
    },
    onEvent({ fx }, node, at, e) {
      if (node.behavior.type === 'broadcast' && e.type === 'pulse.exit') fx.ring(at, C.amber, 90)
    },
  }
}

// State: the node takes the color of its state and shows the path of states.
export function state(): Skin {
  return {
    drawNode({ d, gl, state: sim }, node, at) {
      if (node.behavior.type !== 'machine') return
      const states = Object.keys(node.behavior.states)
      const current = sim.nodeState[node.id] ?? node.behavior.initial
      const y = at.y + NODE_H / 2 + 28
      states.forEach((s, i) => {
        const x = at.x - ((states.length - 1) * 14) / 2 + i * 14
        const on = s === current
        if (i > 0) d.moveTo(x - 10, y).lineTo(x - 4, y).stroke({ width: 1, color: C.muted, alpha: 0.6 })
        d.circle(x, y, on ? 4.5 : 3).fill({ color: on ? stateColor(s) : C.muted })
        if (on) gl.circle(x, y, 7).fill({ color: stateColor(s), alpha: 0.7 })
      })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'node.state') fx.ring(at, stateColor(e.state), 80)
    },
  }
}

const STATE_COLORS = [C.amber, C.cyan, C.violet, C.green, C.red]
// States keep the colors they had when their ids were Spanish words (the color used to come from hashing the name).
const KNOWN_STATE_COLORS: Record<string, number> = { pending: C.cyan, paid: C.amber, preparing: C.green, delivered: C.green, cancelled: C.violet, closed: C.cyan, open: C.violet }
export const stateColor = (name: string) => KNOWN_STATE_COLORS[name] ?? STATE_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % STATE_COLORS.length]

// Command: a tray with the waiting cards; undo flips them.
export function command(): Skin {
  return {
    drawNode({ d, gl, state: sim }, node, at) {
      if (node.behavior.type !== 'buffer') {
        d.roundRect(at.x + NODE_W / 2 - 18, at.y - NODE_H / 2 + 6, 10, 13, 2).stroke({ width: 1.5, color: C.violet })
        return
      }
      const held = sim.pulses.filter((p) => p.status === 'alive' && p.loc.kind === 'node' && p.loc.nodeId === node.id)
      d.roundRect(at.x - NODE_W / 2 + 6, at.y + NODE_H / 2 + 4, NODE_W - 12, 14, 4).stroke({ width: 1.5, color: C.violet, alpha: 0.7 })
      held.forEach((p, i) => {
        const x = at.x - NODE_W / 2 + 12 + i * 16
        d.roundRect(x, at.y + NODE_H / 2 + 6, 12, 10, 2).fill({ color: pulseColor(p.tags) })
        gl.roundRect(x, at.y + NODE_H / 2 + 6, 12, 10, 2).fill({ color: C.violet, alpha: 0.5 })
      })
    },
    onEvent({ fx }, _node, at, e) {
      if (e.type === 'pulse.cancel') {
        fx.ring(at, C.violet, 70)
        fx.float(at, N('render.skin.behavioral.undone'), C.violet)
      }
    },
  }
}

// Chain of Responsibility: each link scans; if it is not its turn, it passes on to the next.
export function chainOfResponsibility(): Skin {
  const scans = new Map<string, number>()
  return {
    drawNode({ d, gl }, node, at) {
      const t = scans.get(node.id) ?? 0
      d.moveTo(at.x + NODE_W / 2 + 4, at.y - 8).lineTo(at.x + NODE_W / 2 + 12, at.y).lineTo(at.x + NODE_W / 2 + 4, at.y + 8).stroke({ width: 1.5, color: C.violet, alpha: 0.7 })
      if (t <= 0) return
      const y = at.y - NODE_H / 2 + (1 - t) * NODE_H
      d.moveTo(at.x - NODE_W / 2 + 4, y).lineTo(at.x + NODE_W / 2 - 4, y).stroke({ width: 2, color: C.violet })
      gl.moveTo(at.x - NODE_W / 2 + 4, y).lineTo(at.x + NODE_W / 2 - 4, y).stroke({ width: 6, color: C.violet, alpha: 0.7 })
      scans.set(node.id, t - 0.05)
    },
    onEvent({ fx }, node, at, e) {
      if (e.type === 'pulse.enter') scans.set(node.id, 1)
      if (e.type === 'pulse.exit') fx.float(at, e.wireId.includes('.next') ? N('render.skin.behavioral.notMine') : N('render.skin.behavioral.handled'), e.wireId.includes('.next') ? C.muted : C.green)
    },
  }
}

// Template Method: the fixed steps carry a lock; the gap waits for the subclass.
export function templateMethod(): Skin {
  return {
    drawNode({ d, gl }, node, at) {
      if (node.behavior.type === 'slot') {
        d.roundRect(at.x - 14, at.y + NODE_H / 2 + 4, 28, 12, 3).stroke({ width: 1.5, color: C.violet })
        gl.roundRect(at.x - 14, at.y + NODE_H / 2 + 4, 28, 12, 3).stroke({ width: 4, color: C.violet, alpha: 0.4 })
        return
      }
      if (node.className === 'Recipe' || node.className === 'Bar') {
        const lx = at.x + NODE_W / 2 - 14
        const ly = at.y - NODE_H / 2 + 9
        arc(d, lx, ly, 3, Math.PI, Math.PI * 2).stroke({ width: 1.5, color: C.muted })
        d.roundRect(lx - 4.5, ly, 9, 6, 1.5).fill({ color: C.muted })
        return
      }
      d.roundRect(at.x - NODE_W / 2 + 6, at.y + NODE_H / 2 - 6, NODE_W - 12, 3, 1.5).fill({ color: C.violet })
    },
  }
}
