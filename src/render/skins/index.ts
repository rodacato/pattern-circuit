import type { PatternId } from '../../engine'
import { NEON as C, pulseColor } from '../theme'
import { NODE_H, NODE_W } from '../layout'
import type { Graphics } from 'pixi.js'
import type { Skin } from './types'

export type { DrawContext, EventContext, Skin } from './types'

// Cada stage crea sus skins: el estado de animación (qué cartucho brilla, qué prensa baja) no se comparte.
export function createSkins(): Partial<Record<PatternId, Skin>> {
  return {
    strategy: strategy(),
    observer: observer(),
    decorator: decorator(),
    'factory-method': factoryMethod(),
    builder: builder(),
    singleton: singleton(),
  }
}

// Strategy: el nodo contexto tiene una ranura; cada estrategia concreta es un cartucho con franja violeta.
function strategy(): Skin {
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

// Observer: el sujeto emite una onda por cada aviso; los suscriptores llevan "antenas".
function observer(): Skin {
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

// Decorator: anillos alrededor del nodo que envuelve y alrededor de cada pulso envuelto.
function decorator(): Skin {
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

// Factory Method: cada creador es una prensa con molde que baja al estampar el producto.
function factoryMethod(): Skin {
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
function builder(): Skin {
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
function singleton(): Skin {
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

// Pixi continúa el trazo anterior al dibujar un arco: hay que moverse a su inicio primero.
function arc(d: Graphics, x: number, y: number, r: number, from: number, to: number) {
  return d.moveTo(x + Math.cos(from) * r, y + Math.sin(from) * r).arc(x, y, r, from, to)
}
