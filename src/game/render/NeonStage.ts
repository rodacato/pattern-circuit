import { Application, BlurFilter, Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js'
import { pointAt, wirePath, type NodeDef, type Point, type Pulse, type SimEvent } from '../../engine'
import type { GameSession } from '../session'
import { DROP_TEXT, FONT_MONO, FONT_UI, NEON as C, pulseColor } from './theme'

const CELL = 62
const NODE_W = 112
const NODE_H = 50
const PORT_R = 6

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: number; size: number }
type Floater = { text: Text; life: number }
type Drag = { from: string; to: Point }

// Render neón del circuito. Lee la sesión cada frame y le devuelve las acciones del jugador.
export class NeonStage {
  readonly app = new Application()
  private readonly world = new Container()
  private readonly base = new Graphics()
  private readonly glow = new Graphics()
  private readonly dynamic = new Graphics()
  private readonly nodesLayer = new Container()
  private readonly floaters = new Container()
  private session!: GameSession
  private builtVersion = -1
  private bounds = { w: 0, h: 0 }
  private trails = new Map<number, Point[]>()
  private flash = new Map<string, { t: number; color: number }>()
  private shake = new Map<string, number>()
  private particles: Particle[] = []
  private floatersList: Floater[] = []
  private hovered?: string
  private drag?: Drag
  private positions = new Map<number, Point>()
  private views = new Map<string, Container>()
  private followLabel = new Text({ text: '', style: { fontFamily: FONT_UI, fontSize: 11, fontWeight: '600', fill: C.white } })

  static async create(host: HTMLElement, session: GameSession): Promise<NeonStage> {
    const stage = new NeonStage()
    stage.session = session
    await stage.app.init({ resizeTo: host, background: C.bg, antialias: true, resolution: devicePixelRatio, autoDensity: true })
    host.appendChild(stage.app.canvas)

    const glowLayer = new Container()
    glowLayer.addChild(stage.glow)
    glowLayer.filters = [new BlurFilter({ strength: 12, quality: 4 })]
    glowLayer.blendMode = 'add'
    stage.followLabel.anchor.set(0.5, 1)
    stage.world.addChild(stage.base, glowLayer, stage.dynamic, stage.nodesLayer, stage.floaters, stage.followLabel)
    stage.app.stage.addChild(stage.world)
    stage.bindPointer()
    stage.app.ticker.add((t) => stage.tick(t.deltaTime))
    return stage
  }

  destroy() {
    this.app.destroy(true, { children: true })
  }

  private tick(delta: number) {
    const s = this.session
    if (s.circuitVersion !== this.builtVersion) this.build()
    s.update(delta)
    const time = performance.now()
    this.fit()
    for (const e of s.drainEvents()) this.onEvent(e)

    const d = this.dynamic.clear()
    const gl = this.glow.clear()
    this.drawFlow(d, time)
    this.drawHint(d, gl, time)
    this.drawNodes(d, gl, time)
    this.drawDrag(d, gl)
    this.drawPulses(d, gl)
    this.drawParticles(d, gl)
    this.updateFloaters()
  }

  private build() {
    const s = this.session
    this.builtVersion = s.circuitVersion
    this.trails.clear()
    const nodes = [...s.circuit.nodes.values()]
    this.bounds = {
      w: Math.max(...nodes.map((n) => n.at[0])) * CELL,
      h: Math.max(...nodes.map((n) => n.at[1])) * CELL,
    }

    const g = this.base.clear()
    for (let x = -4; x <= this.bounds.w / CELL + 4; x++) {
      for (let y = -4; y <= this.bounds.h / CELL + 4; y++) g.circle(x * CELL, y * CELL, 1.3).fill({ color: C.grid })
    }
    for (const w of s.circuit.wires.values()) {
      const pts = w.path.map(toPx)
      g.moveTo(pts[0].x, pts[0].y)
      for (const p of pts.slice(1)) g.lineTo(p.x, p.y)
      const abstract = w.dep === 'abstract'
      g.stroke({ width: 3, color: abstract ? C.violet : C.wire, alpha: abstract ? 0.35 : 0.9, join: 'round', cap: 'round' })
    }

    this.nodesLayer.removeChildren().forEach((c) => c.destroy({ children: true }))
    this.views.clear()
    for (const n of nodes) {
      const view = this.nodeView(n)
      this.views.set(n.id, view)
      this.nodesLayer.addChild(view)
    }
  }

  private nodeView(n: NodeDef): Container {
    const box = new Container()
    const p = toPx({ x: n.at[0], y: n.at[1] })
    box.position.set(p.x, p.y)
    box.eventMode = 'static'
    box.cursor = 'pointer'
    box.hitArea = new Rectangle(-NODE_W / 2, -NODE_H / 2, NODE_W, NODE_H)
    box.on('pointerover', () => (this.hovered = n.id))
    box.on('pointerout', () => this.hovered === n.id && (this.hovered = undefined))
    box.on('pointertap', () => this.session.inspect(this.session.inspected === n.id ? undefined : n.id))

    const label = new Text({ text: n.label, style: { fontFamily: FONT_UI, fontSize: 13, fontWeight: '600', fill: C.text } })
    label.anchor.set(0.5, 1)
    label.y = 3
    const sub = new Text({ text: n.className ?? (n.kind === 'actor' ? 'actor' : ''), style: { fontFamily: FONT_MONO, fontSize: 10, fill: C.muted } })
    sub.anchor.set(0.5, 0)
    sub.y = 6
    box.addChild(label, sub)

    const port = new Graphics().circle(0, 0, PORT_R + 6).fill({ color: 0xffffff, alpha: 0.001 })
    port.position.set(NODE_W / 2, 0)
    port.eventMode = 'static'
    port.cursor = 'crosshair'
    port.label = 'port'
    port.on('pointerdown', (e: FederatedPointerEvent) => {
      if (!this.session.pendingRepairs.length) return
      e.stopPropagation()
      this.drag = { from: n.id, to: this.world.toLocal(e.global) }
    })
    box.addChild(port)
    return box
  }

  private bindPointer() {
    const stage = this.app.stage
    stage.eventMode = 'static'
    stage.hitArea = this.app.screen
    stage.on('globalpointermove', (e: FederatedPointerEvent) => {
      if (this.drag) this.drag.to = this.world.toLocal(e.global)
    })
    stage.on('pointerup', () => this.endDrag())
    stage.on('pointerupoutside', () => this.endDrag())
    stage.on('pointerdown', (e: FederatedPointerEvent) => {
      const at = this.world.toLocal(e.global)
      let best: { id: number; d: number } | undefined
      for (const [id, p] of this.positions) {
        const d = Math.hypot(p.x - at.x, p.y - at.y)
        if (d < 18 && (!best || d < best.d)) best = { id, d }
      }
      if (best) this.session.follow(best.id)
    })
  }

  private endDrag() {
    const drag = this.drag
    if (!drag) return
    this.drag = undefined
    const target = [...this.session.circuit.nodes.values()].find((n) => {
      const p = toPx({ x: n.at[0], y: n.at[1] })
      return Math.abs(drag.to.x - p.x) <= NODE_W / 2 && Math.abs(drag.to.y - p.y) <= NODE_H / 2
    })
    if (!target) return
    const result = this.session.connect(drag.from, target.id)
    const at = toPx({ x: target.at[0], y: target.at[1] })
    if (result === 'repaired') {
      this.burst(at, C.green, 30, 3)
      this.float(at, '¡conectado!', C.green)
    } else if (result === 'wrong') {
      this.burst(drag.to, C.red, 16, 2.4)
      this.float(at, 'ese cable no resuelve nada aquí', C.red)
    }
  }

  private fit() {
    const { width, height } = this.app.screen
    const zoom = Math.min(width / (this.bounds.w + CELL * 3.6), height / (this.bounds.h + CELL * 3.4), 1.7)
    this.world.scale.set(zoom)
    this.world.position.set(Math.round((width - this.bounds.w * zoom) / 2), Math.round((height - this.bounds.h * zoom) / 2))
  }

  private onEvent(e: SimEvent) {
    const s = this.session
    const node = 'nodeId' in e ? s.circuit.nodes.get(e.nodeId) : undefined
    if (!node) return
    const at = toPx({ x: node.at[0], y: node.at[1] })
    const pulse = 'pulseId' in e ? s.timeline.current.state.pulses.find((p) => p.id === e.pulseId) : undefined
    const color = pulse ? pulseColor(pulse.tags) : C.cyan
    switch (e.type) {
      case 'pulse.enter':
        this.flash.set(e.nodeId, { t: 1, color })
        break
      case 'pulse.branch':
        this.flash.set(e.nodeId, { t: 1.4, color: e.branch === 'else' ? C.red : C.violet })
        break
      case 'pulse.drop':
        this.burst(at, C.red, 28, 3.4)
        this.shake.set(e.nodeId, 1)
        this.float(at, `¡pedido perdido! · ${DROP_TEXT[e.reason]}`, C.red)
        this.trails.delete(e.pulseId)
        break
      case 'pulse.deliver': {
        const dup = (s.timeline.current.state.deliveredOrigins[pulse!.originId] ?? 0) > 1
        this.burst(at, dup ? C.amber : C.green, 20, 2.4)
        this.float(at, dup ? '¡cobrado otra vez!' : `☕ ${pulse?.label ?? 'pedido'} entregado`, dup ? C.amber : C.green)
        this.trails.delete(e.pulseId)
        break
      }
      case 'pulse.clone':
        this.burst(at, C.amber, 10, 1.6)
        break
    }
  }

  private drawFlow(d: Graphics, time: number) {
    for (const w of this.session.circuit.wires.values()) {
      const abstract = w.dep === 'abstract'
      const step = 0.45 / w.length
      const offset = ((time / 1000) * 0.6) / w.length
      for (let t = offset % step; t < 1; t += step) {
        const a = toPx(pointAt(w.path, t))
        const b = toPx(pointAt(w.path, Math.min(1, t + step * (abstract ? 0.35 : 0.2))))
        d.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: 2, color: abstract ? C.violet : C.cyan, alpha: 0.55, cap: 'round' })
      }
    }
  }

  // Tras un intento fallido, un cable fantasma sugiere la reparación pendiente.
  private drawHint(d: Graphics, gl: Graphics, time: number) {
    const s = this.session
    if (!s.failedRuns || this.drag) return
    const beat = 0.5 + 0.5 * Math.sin(time / 260)
    for (const r of s.pendingRepairs) {
      for (const w of r.patch.add?.wires ?? []) {
        const a = s.circuit.nodes.get(w.from)
        const b = s.circuit.nodes.get(w.to)
        if (!a || !b) continue
        const path = wirePath(a.at, b.at).map(toPx)
        const from = { x: path[0].x + NODE_W / 2, y: path[0].y }
        const to = { x: path[path.length - 1].x - NODE_W / 2, y: path[path.length - 1].y }
        dashed(d, from, to, 7, 6, C.green, 0.25 + beat * 0.5)
        gl.circle(from.x, from.y, 10).fill({ color: C.green, alpha: 0.3 + beat * 0.5 })
      }
    }
  }

  private drawNodes(d: Graphics, gl: Graphics, time: number) {
    const s = this.session
    const state = s.timeline.current.state
    const connecting = s.pendingRepairs.length > 0
    for (const n of s.circuit.nodes.values()) {
      const base = toPx({ x: n.at[0], y: n.at[1] })
      const sh = this.shake.get(n.id) ?? 0
      const p = { x: base.x + Math.sin(time / 18) * sh * 5, y: base.y }
      this.views.get(n.id)!.x = p.x
      const f = this.flash.get(n.id)
      const touched = s.touched.includes(n.id)
      const selected = s.inspected === n.id
      const hover = this.hovered === n.id || (this.drag && this.overNode(n))
      const beat = touched ? 0.5 + 0.5 * Math.sin(time / 180) : 0
      const color = touched ? C.red : n.behavior.type === 'slot' ? C.violet : n.kind === 'actor' ? C.amber : C.cyan
      const scale = 1 + (f ? f.t * 0.06 : 0) + (hover ? 0.03 : 0)
      const w = NODE_W * scale
      const h = NODE_H * scale
      const x = p.x - w / 2
      const y = p.y - h / 2

      d.roundRect(x, y, w, h, 12).fill({ color: C.panel, alpha: 0.94 })
      d.roundRect(x, y, w, h, 12).stroke({ width: selected ? 3 : 2, color: selected ? C.white : f ? f.color : color, alpha: 0.95 })
      gl.roundRect(x, y, w, h, 12).stroke({ width: 5, color: f ? f.color : color, alpha: 0.3 + (f ? f.t * 0.5 : 0) + beat * 0.6 + (hover ? 0.3 : 0) })

      if (n.behavior.type === 'branch') this.drawBranchGlyph(d, p, Object.keys(n.behavior.cases).length)
      if (n.behavior.type === 'slot') this.drawSocket(d, gl, { x: p.x + w / 2, y: p.y }, time)
      if (connecting && n.behavior.type !== 'sink') {
        const pr = PORT_R * (this.drag?.from === n.id ? 1.4 : 1)
        d.circle(p.x + w / 2, p.y, pr).fill({ color: C.bg }).stroke({ width: 2, color: C.green })
        gl.circle(p.x + w / 2, p.y, pr + 2).fill({ color: C.green, alpha: 0.35 })
      }

      const load = state.load[n.id] ?? 0
      const pips = Math.min(load, 6)
      for (let i = 0; i < pips; i++) d.circle(p.x - (pips - 1) * 5 + i * 10, p.y + h / 2 + 9, 2.5).fill({ color: C.amber })

      if (f && (f.t -= 0.05) <= 0) this.flash.delete(n.id)
      if (sh && this.shake.set(n.id, sh - 0.04).get(n.id)! <= 0) this.shake.delete(n.id)
    }
  }

  private overNode(n: NodeDef) {
    const p = toPx({ x: n.at[0], y: n.at[1] })
    return !!this.drag && Math.abs(this.drag.to.x - p.x) <= NODE_W / 2 && Math.abs(this.drag.to.y - p.y) <= NODE_H / 2
  }

  // El árbol de if/elsif: una rama por caso más el `else` que pierde pedidos.
  private drawBranchGlyph(d: Graphics, p: Point, cases: number) {
    const x0 = p.x - NODE_W / 2 + 12
    for (let i = 0; i <= cases; i++) {
      const y = p.y - 12 + i * (24 / cases)
      d.moveTo(x0, p.y).lineTo(x0 + 7, y).lineTo(x0 + 12, y).stroke({ width: 1.5, color: i === cases ? C.red : C.amber, alpha: 0.9 })
    }
  }

  private drawSocket(d: Graphics, gl: Graphics, c: Point, time: number) {
    const r = 11 + Math.sin(time / 300) * 0.8
    const hex = Array.from({ length: 6 }, (_, i) => [c.x + r * Math.cos((Math.PI / 3) * i), c.y + r * Math.sin((Math.PI / 3) * i)]).flat()
    d.poly(hex).fill({ color: C.bg }).stroke({ width: 2, color: C.violet })
    gl.poly(hex).stroke({ width: 5, color: C.violet, alpha: 0.8 })
  }

  private drawDrag(d: Graphics, gl: Graphics) {
    if (!this.drag) return
    const n = this.session.circuit.nodes.get(this.drag.from)!
    const from = toPx({ x: n.at[0], y: n.at[1] })
    from.x += NODE_W / 2
    d.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 3, color: C.green, cap: 'round' })
    gl.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 8, color: C.green, alpha: 0.6 })
    d.circle(this.drag.to.x, this.drag.to.y, 5).fill({ color: C.green })
  }

  private drawPulses(d: Graphics, gl: Graphics) {
    const s = this.session
    const prev = new Map(s.prevState.pulses.map((p) => [p.id, p]))
    const perNode = new Map<string, number>()
    this.positions.clear()
    this.followLabel.visible = false
    for (const p of s.timeline.current.state.pulses) {
      if (p.status !== 'alive') continue
      const pos = this.pulsePosition(p, prev.get(p.id), perNode)
      this.positions.set(p.id, pos)
      const color = pulseColor(p.tags)
      const trail = this.trails.get(p.id) ?? []
      const last = trail[trail.length - 1]
      if (!last || last.x !== pos.x || last.y !== pos.y) trail.push(pos)
      if (trail.length > 16) trail.shift()
      this.trails.set(p.id, trail)
      trail.forEach((t, i) => {
        const a = i / trail.length
        d.circle(t.x, t.y, 5 * a).fill({ color, alpha: a * 0.35 })
      })
      gl.circle(pos.x, pos.y, 13).fill({ color, alpha: 0.9 })
      d.circle(pos.x, pos.y, 6.5).fill({ color })
      d.circle(pos.x, pos.y, 3).fill({ color: 0xffffff })
      if (s.followed === p.id) {
        this.followLabel.text = `#${p.id}${p.label ? ` · ${p.label}` : ''}`
        this.followLabel.position.set(pos.x, pos.y - 16)
        this.followLabel.visible = true
        d.circle(pos.x, pos.y, 12).stroke({ width: 1.5, color: C.white, alpha: 0.9 })
        gl.circle(pos.x, pos.y, 14).stroke({ width: 3, color: C.white, alpha: 0.5 })
      }
    }
  }

  private pulsePosition(p: Pulse, before: Pulse | undefined, perNode: Map<string, number>): Point {
    const s = this.session
    if (p.loc.kind === 'wire') {
      const wire = s.circuit.wires.get(p.loc.wireId)!
      const from = before?.loc.kind === 'wire' && before.loc.wireId === p.loc.wireId ? before.loc.progress : p.loc.progress
      return toPx(pointAt(wire.path, from + (p.loc.progress - from) * s.alpha))
    }
    const n = s.circuit.nodes.get(p.loc.nodeId)!
    const k = perNode.get(n.id) ?? 0
    perNode.set(n.id, k + 1)
    const c = toPx({ x: n.at[0], y: n.at[1] })
    return { x: c.x - NODE_W / 2 + 16 + k * 16, y: c.y - NODE_H / 2 }
  }

  private drawParticles(d: Graphics, gl: Graphics) {
    this.particles = this.particles.filter((q) => (q.life -= 0.022) > 0)
    for (const q of this.particles) {
      q.x += q.vx
      q.y += q.vy
      q.vx *= 0.95
      q.vy *= 0.95
      d.circle(q.x, q.y, q.size * q.life).fill({ color: q.color, alpha: q.life })
      gl.circle(q.x, q.y, q.size * 2 * q.life).fill({ color: q.color, alpha: q.life * 0.6 })
    }
  }

  private burst(at: Point, color: number, count: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.3
      const v = speed * (0.5 + Math.random() * 0.8)
      this.particles.push({ x: at.x, y: at.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color, size: 2.6 })
    }
  }

  private float(at: Point, text: string, color: number) {
    const t = new Text({ text, style: { fontFamily: FONT_UI, fontSize: 12, fontWeight: '700', fill: color } })
    t.anchor.set(0.5)
    t.position.set(at.x, at.y - 44)
    this.floaters.addChild(t)
    this.floatersList.push({ text: t, life: 1 })
  }

  private updateFloaters() {
    this.floatersList = this.floatersList.filter((f) => {
      f.life -= 0.01
      f.text.y -= 0.45
      f.text.alpha = Math.min(1, f.life * 2)
      if (f.life > 0) return true
      f.text.destroy()
      return false
    })
  }
}

const toPx = (p: Point): Point => ({ x: p.x * CELL, y: p.y * CELL })

function dashed(g: Graphics, a: Point, b: Point, dash: number, gap: number, color: number, alpha: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  for (let t = 0; t < len; t += dash + gap) {
    const e = Math.min(t + dash, len)
    g.moveTo(a.x + ux * t, a.y + uy * t).lineTo(a.x + ux * e, a.y + uy * e)
  }
  g.stroke({ width: 3, color, alpha, cap: 'round' })
}
