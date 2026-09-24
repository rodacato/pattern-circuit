import { Container, Graphics, Text } from 'pixi.js'
import type { Point } from '../engine'
import { FONT_UI } from './theme'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: number; size: number }
type Ring = { x: number; y: number; r: number; max: number; life: number; color: number }
type Floater = { text: Text; life: number }

// Efectos efímeros: partículas, ondas y textos que suben. Viven en coordenadas del mundo.
// Con movimiento reducido solo quedan los textos, quietos: la información se mantiene, el movimiento no.
export class Effects {
  private particles: Particle[] = []
  private rings: Ring[] = []
  private floaters: Floater[] = []
  private readonly layer: Container
  private readonly reduced: boolean

  constructor(layer: Container, reduced = false) {
    this.layer = layer
    this.reduced = reduced
  }

  burst(at: Point, color: number, count = 20, speed = 2.4) {
    if (this.reduced) return
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.3
      const v = speed * (0.5 + Math.random() * 0.8)
      this.particles.push({ x: at.x, y: at.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color, size: 2.6 })
    }
  }

  ring(at: Point, color: number, max = 70) {
    if (this.reduced) return
    this.rings.push({ x: at.x, y: at.y, r: 8, max, life: 1, color })
  }

  float(at: Point, text: string, color: number) {
    const t = new Text({ text, style: { fontFamily: FONT_UI, fontSize: 12, fontWeight: '700', fill: color } })
    t.anchor.set(0.5)
    t.position.set(at.x, at.y - 44)
    this.layer.addChild(t)
    this.floaters.push({ text: t, life: 1 })
  }

  draw(d: Graphics, gl: Graphics) {
    this.particles = this.particles.filter((q) => (q.life -= 0.022) > 0)
    for (const q of this.particles) {
      q.x += q.vx
      q.y += q.vy
      q.vx *= 0.95
      q.vy *= 0.95
      d.circle(q.x, q.y, q.size * q.life).fill({ color: q.color, alpha: q.life })
      gl.circle(q.x, q.y, q.size * 2 * q.life).fill({ color: q.color, alpha: q.life * 0.6 })
    }

    this.rings = this.rings.filter((r) => (r.life -= 0.025) > 0)
    for (const r of this.rings) {
      r.r += (r.max - r.r) * 0.08
      d.circle(r.x, r.y, r.r).stroke({ width: 2, color: r.color, alpha: r.life * 0.8 })
      gl.circle(r.x, r.y, r.r).stroke({ width: 5, color: r.color, alpha: r.life * 0.5 })
    }

    this.floaters = this.floaters.filter((f) => {
      f.life -= 0.01
      if (!this.reduced) f.text.y -= 0.45
      f.text.alpha = Math.min(1, f.life * 2)
      if (f.life > 0) return true
      f.text.destroy()
      return false
    })
  }
}
