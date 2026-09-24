import { Container, type Text } from 'pixi.js'
import type { NodeDef, PatternId, Point } from '../engine'
import type { Playback } from '../game/playback/Playback'
import { identity, type Translate } from '../i18n'
import { drawShape, label } from './draw'
import { pulsePosition } from './layout'
import type { DrawContext, Skin } from './skins'
import { FONT_MONO, NEON as C, pulseColor } from './theme'

const TRAIL_LENGTH = 16

// Pulsos vivos: posición interpolada, estela, firma de los patrones que visitó, turno y etiqueta del seguido.
export class PulseLayer {
  readonly container = new Container()
  readonly positions = new Map<number, Point>()
  private readonly trails = new Map<number, Point[]>()
  private readonly badges: Text[] = []
  private readonly followLabel = label('', 11, C.white)
  private readonly skins: Partial<Record<PatternId, Skin>>
  private readonly t: Translate

  constructor(skins: Partial<Record<PatternId, Skin>>, t: Translate = identity) {
    this.skins = skins
    this.t = t
    this.followLabel.anchor.set(0.5, 1)
    this.container.addChild(this.followLabel)
  }

  forget(pulseId: number) {
    this.trails.delete(pulseId)
  }

  clear() {
    this.trails.clear()
  }

  draw(ctx: DrawContext, pb: Playback) {
    const { d, gl } = ctx
    const prev = new Map(pb.prevState.pulses.map((p) => [p.id, p]))
    const perNode = new Map<string, number>()
    this.positions.clear()
    this.followLabel.visible = false
    for (const p of pb.timeline.current.state.pulses) {
      if (p.status !== 'alive') continue
      const slot = p.loc.kind === 'wire' ? 0 : (perNode.get(p.loc.nodeId) ?? 0)
      if (p.loc.kind !== 'wire') perNode.set(p.loc.nodeId, slot + 1)
      const pos = pulsePosition(pb.circuit, p, prev.get(p.id), pb.alpha, slot)
      this.positions.set(p.id, pos)
      const color = pulseColor(p.tags)

      this.drawTrail(d, p.id, pos, color)
      gl.circle(pos.x, pos.y, 13).fill({ color, alpha: 0.9 })
      drawShape(d, p.shape, pos, 7, color)
      d.circle(pos.x, pos.y, 2.6).fill({ color: 0xffffff })

      const visited = p.trail.map((id) => pb.circuit.nodes.get(id)).filter((n): n is NodeDef => !!n?.skin)
      for (const pattern of new Set(visited.map((n) => n.skin!))) {
        this.skins[pattern]?.drawPulse?.(ctx, p, pos, visited.filter((n) => n.skin === pattern))
      }

      if (pb.followed === p.id) {
        this.followLabel.text = `#${p.id}${p.label ? ` · ${this.t(p.label)}` : ''}`
        this.followLabel.position.set(pos.x, pos.y - 16)
        this.followLabel.visible = true
        d.circle(pos.x, pos.y, 12).stroke({ width: 1.5, color: C.white, alpha: 0.9 })
        gl.circle(pos.x, pos.y, 14).stroke({ width: 3, color: C.white, alpha: 0.5 })
      }
    }
    // Tras reiniciar o retroceder los ids se reutilizan: una estela sin pulso vivo se descarta.
    for (const id of this.trails.keys()) if (!this.positions.has(id)) this.trails.delete(id)
    this.drawBadges(pb)
  }

  private drawTrail(d: DrawContext['d'], id: number, pos: Point, color: number) {
    const trail = this.trails.get(id) ?? []
    const last = trail[trail.length - 1]
    if (!last || last.x !== pos.x || last.y !== pos.y) trail.push(pos)
    if (trail.length > TRAIL_LENGTH) trail.shift()
    this.trails.set(id, trail)
    trail.forEach((t, i) => {
      const a = i / trail.length
      d.circle(t.x, t.y, 5 * a).fill({ color, alpha: a * 0.35 })
    })
  }

  // Número de turno u otros datos visibles del pulso, en una etiqueta pequeña.
  private drawBadges(pb: Playback) {
    let used = 0
    for (const p of pb.timeline.current.state.pulses) {
      const pos = this.positions.get(p.id)
      if (!pos || p.data.ticket === undefined) continue
      const badge = (this.badges[used] ??= this.container.addChild(label('', 10, C.amber, FONT_MONO, '700')))
      badge.anchor.set(0, 0.5)
      badge.text = `#${p.data.ticket}`
      badge.position.set(pos.x + 10, pos.y + 10)
      badge.visible = true
      used++
    }
    for (let i = used; i < this.badges.length; i++) this.badges[i].visible = false
  }
}
