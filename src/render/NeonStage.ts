import { Application, BlurFilter, Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js'
import { PATTERNS, pointAt, wirePath, type NodeDef, type PatternId, type Point, type PulseShape, type SimEvent } from '../engine'
import type { GameSession } from '../game/session/GameSession'
import { Effects } from './fx'
import {
  CELL,
  circuitBounds,
  fitWorld,
  nearestPulse,
  NODE_H,
  NODE_W,
  nodeAt,
  nodeCenter,
  outPort,
  pulsePosition,
  SOCKET_R,
  socketCenter,
  toPx,
  withinSocket,
} from './layout'
import { createSkins, type DrawContext, type Skin } from './skins'
import { DROP_TEXT, FAMILY_COLORS, FONT_MONO, FONT_UI, INVALID_TEXT, NEON as C, pulseColor } from './theme'

const PORT_R = 6
const APPEAR_FRAMES = 28

type Drag = { from: string; to: Point }

// Render neón del circuito. Lee la sesión cada frame y traduce gestos a comandos; no decide nada del juego.
export class NeonStage {
  readonly app = new Application()
  private readonly world = new Container()
  private readonly base = new Graphics()
  private readonly glow = new Graphics()
  private readonly dynamic = new Graphics()
  private readonly nodesLayer = new Container()
  private readonly fxLayer = new Container()
  private readonly followLabel = label('', 11, C.white)
  private readonly socketLabel = label('', 11, C.violet)
  private readonly fx = new Effects(this.fxLayer)
  private readonly skins: Partial<Record<PatternId, Skin>> = createSkins()
  private session!: GameSession
  private builtVersion = -1
  private bounds = { w: 0, h: 0 }
  private trails = new Map<number, Point[]>()
  private flash = new Map<string, { t: number; color: number }>()
  private shake = new Map<string, number>()
  private appear = new Map<string, number>()
  private positions = new Map<number, Point>()
  private views = new Map<string, Container>()
  private hovered?: string
  private drag?: Drag
  private dropHover = false
  private lastPlugged?: string

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
    stage.socketLabel.anchor.set(0.5, 1)
    stage.world.addChild(stage.base, glowLayer, stage.dynamic, stage.nodesLayer, stage.fxLayer, stage.followLabel, stage.socketLabel)
    stage.app.stage.addChild(stage.world)
    stage.bindPointer()
    stage.app.ticker.add((t) => stage.tick(t.deltaTime))
    return stage
  }

  destroy() {
    this.app.destroy(true, { children: true })
  }

  // --- API para la ui: soltar un cartucho desde el DOM sobre el socket del canvas ---

  socketAtClient(clientX: number, clientY: number): string | undefined {
    const socket = this.session.socket
    const at = socket && this.socketPoint()
    return at && withinSocket(at, this.clientToWorld(clientX, clientY)) ? socket.id : undefined
  }

  setDropHover(active: boolean) {
    this.dropHover = active
  }

  // --- bucle ---

  private tick(delta: number) {
    const s = this.session
    if (s.circuitVersion !== this.builtVersion) this.build()
    s.update(delta)
    const time = performance.now()
    const fit = fitWorld(this.app.screen, this.bounds)
    this.world.scale.set(fit.zoom)
    this.world.position.set(fit.x, fit.y)
    for (const e of s.playback.drainEvents()) this.onEvent(e)

    const d = this.dynamic.clear()
    const gl = this.glow.clear()
    const ctx: DrawContext = { d, gl, time, circuit: s.playback.circuit }
    this.drawFlow(d, time)
    this.drawHint(d, gl, time)
    this.drawNodes(ctx)
    this.drawSocket(d, gl, time)
    this.drawDrag(d, gl)
    this.drawPulses(ctx)
    this.fx.draw(d, gl)
  }

  private build() {
    const s = this.session
    this.builtVersion = s.circuitVersion
    this.trails.clear()
    const nodes = [...s.playback.circuit.nodes.values()]
    const before = new Set(this.views.keys())
    this.bounds = circuitBounds([...nodes, ...s.level.circuit.nodes])

    const g = this.base.clear()
    for (let x = -4; x <= this.bounds.w / CELL + 4; x++) {
      for (let y = -4; y <= this.bounds.h / CELL + 4; y++) g.circle(x * CELL, y * CELL, 1.3).fill({ color: C.grid })
    }
    for (const w of s.playback.circuit.wires.values()) {
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
      if (before.size && !before.has(n.id)) this.appear.set(n.id, 0)
    }
    this.celebratePlug()
  }

  // Enchufar un patrón: onda y chispas del color de su familia sobre el socket.
  private celebratePlug() {
    const plugged = this.session.flow.plugged?.pattern
    if (plugged === this.lastPlugged) return
    this.lastPlugged = plugged
    const at = this.socketPoint()
    if (!plugged || !at) return
    const color = FAMILY_COLORS[PATTERNS[plugged].family]
    this.fx.ring(at, color, 110)
    this.fx.burst(at, color, 34, 3.2)
    this.fx.float(at, `${PATTERNS[plugged].name} enchufado`, color)
  }

  private nodeView(n: NodeDef): Container {
    const box = new Container()
    const p = nodeCenter(n)
    box.position.set(p.x, p.y)
    box.eventMode = 'static'
    box.cursor = 'pointer'
    box.hitArea = new Rectangle(-NODE_W / 2, -NODE_H / 2, NODE_W, NODE_H)
    box.on('pointerover', () => (this.hovered = n.id))
    box.on('pointerout', () => this.hovered === n.id && (this.hovered = undefined))
    box.on('pointertap', () => this.session.inspect(this.session.playback.inspected === n.id ? undefined : n.id))

    const title = label(n.label, 13, C.text, FONT_UI, '600')
    title.anchor.set(0.5, 1)
    title.y = 3
    const sub = label(n.className ?? (n.kind === 'actor' ? 'actor' : ''), 10, C.muted, FONT_MONO, '400')
    sub.anchor.set(0.5, 0)
    sub.y = 6
    box.addChild(title, sub)

    const port = new Graphics().circle(0, 0, PORT_R + 6).fill({ color: 0xffffff, alpha: 0.001 })
    port.position.set(NODE_W / 2, 0)
    port.eventMode = 'static'
    port.cursor = 'crosshair'
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
      const id = nearestPulse(this.positions, this.world.toLocal(e.global))
      if (id !== undefined) this.session.follow(id)
    })
  }

  private endDrag() {
    const drag = this.drag
    if (!drag) return
    this.drag = undefined
    const target = nodeAt(this.session.playback.circuit.nodes.values(), drag.to)
    if (!target) return
    const result = this.session.connect(drag.from, target.id)
    const at = nodeCenter(target)
    if (result === 'repaired') {
      this.fx.burst(at, C.green, 30, 3)
      this.fx.float(at, '¡conectado!', C.green)
    } else if (result === 'wrong') {
      this.fx.burst(drag.to, C.red, 16, 2.4)
      this.fx.float(at, 'ese cable no resuelve nada aquí', C.red)
    }
  }

  private clientToWorld(clientX: number, clientY: number): Point {
    const rect = this.app.canvas.getBoundingClientRect()
    return this.world.toLocal({ x: clientX - rect.left, y: clientY - rect.top })
  }

  private socketPoint(): Point | undefined {
    const socket = this.session.socket
    return socket && socketCenter(this.session.level.circuit.nodes, socket.at)
  }

  private skinOf(n: NodeDef): Skin | undefined {
    return n.skin ? this.skins[n.skin] : undefined
  }

  private onEvent(e: SimEvent) {
    const s = this.session
    const node = 'nodeId' in e ? s.playback.circuit.nodes.get(e.nodeId) : undefined
    if (!node) return
    const at = nodeCenter(node)
    const pulse = 'pulseId' in e ? s.playback.timeline.current.state.pulses.find((p) => p.id === e.pulseId) : undefined
    this.skinOf(node)?.onEvent?.({ fx: this.fx, circuit: s.playback.circuit, pulse }, node, at, e)
    const color = pulse ? pulseColor(pulse.tags) : C.cyan
    switch (e.type) {
      case 'pulse.enter':
        this.flash.set(e.nodeId, { t: 1, color })
        break
      case 'pulse.branch':
        this.flash.set(e.nodeId, { t: 1.4, color: e.branch === 'else' ? C.red : C.violet })
        break
      case 'pulse.drop':
        this.fx.burst(at, C.red, 28, 3.4)
        this.shake.set(e.nodeId, 1)
        this.fx.float(at, `¡pedido perdido! · ${DROP_TEXT[e.reason]}`, C.red)
        this.trails.delete(e.pulseId)
        break
      case 'pulse.deliver': {
        const dup = (s.playback.timeline.current.state.deliveredOrigins[pulse!.originId] ?? 0) > 1
        const tone = !e.valid ? C.red : dup ? C.amber : C.green
        const text = !e.valid ? INVALID_TEXT : dup ? '¡cobrado otra vez!' : `☕ ${pulse?.label ?? 'pedido'} entregado`
        this.fx.burst(at, tone, 20, 2.4)
        this.fx.float(at, text, tone)
        if (!e.valid) this.shake.set(e.nodeId, 0.7)
        this.trails.delete(e.pulseId)
        break
      }
      case 'pulse.clone':
        this.fx.burst(at, C.amber, 10, 1.6)
        break
    }
  }

  private drawFlow(d: Graphics, time: number) {
    for (const w of this.session.playback.circuit.wires.values()) {
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
        const a = s.playback.circuit.nodes.get(w.from)
        const b = s.playback.circuit.nodes.get(w.to)
        if (!a || !b) continue
        const path = wirePath(a.at, b.at).map(toPx)
        const from = { x: path[0].x + NODE_W / 2, y: path[0].y }
        const to = { x: path[path.length - 1].x - NODE_W / 2, y: path[path.length - 1].y }
        dashed(d, from, to, C.green, 0.25 + beat * 0.5)
        gl.circle(from.x, from.y, 10).fill({ color: C.green, alpha: 0.3 + beat * 0.5 })
      }
    }
  }

  private drawNodes(ctx: DrawContext) {
    const { d, gl, time } = ctx
    const s = this.session
    const state = s.playback.timeline.current.state
    const connecting = s.pendingRepairs.length > 0
    for (const n of s.playback.circuit.nodes.values()) {
      const base = nodeCenter(n)
      const sh = this.shake.get(n.id) ?? 0
      const p = { x: base.x + Math.sin(time / 18) * sh * 5, y: base.y }
      const grow = this.appear.has(n.id) ? easeOutBack(this.appear.get(n.id)! / APPEAR_FRAMES) : 1
      const view = this.views.get(n.id)!
      view.position.set(p.x, p.y)
      view.scale.set(grow)
      view.alpha = Math.min(1, grow)

      const f = this.flash.get(n.id)
      const touched = s.touched.includes(n.id)
      const selected = s.playback.inspected === n.id
      const hover = this.hovered === n.id || (!!this.drag && !!nodeAt([n], this.drag.to))
      const beat = touched ? 0.5 + 0.5 * Math.sin(time / 180) : 0
      const color = touched ? C.red : n.behavior.type === 'slot' ? C.violet : n.kind === 'actor' ? C.amber : C.cyan
      const scale = grow * (1 + (f ? f.t * 0.06 : 0) + (hover ? 0.03 : 0))
      const w = NODE_W * scale
      const h = NODE_H * scale
      const x = p.x - w / 2
      const y = p.y - h / 2

      d.roundRect(x, y, w, h, 12).fill({ color: C.panel, alpha: 0.94 * Math.min(1, grow) })
      d.roundRect(x, y, w, h, 12).stroke({ width: selected ? 3 : 2, color: selected ? C.white : f ? f.color : color, alpha: 0.95 })
      gl.roundRect(x, y, w, h, 12).stroke({ width: 5, color: f ? f.color : color, alpha: 0.3 + (f ? f.t * 0.5 : 0) + beat * 0.6 + (hover ? 0.3 : 0) })

      if (grow >= 1) this.skinOf(n)?.drawNode?.(ctx, n, p)
      if (n.behavior.type === 'branch') drawBranchGlyph(d, p, Object.keys(n.behavior.cases).length)
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
      if (this.appear.has(n.id)) {
        const t = this.appear.get(n.id)! + 1
        if (t >= APPEAR_FRAMES) this.appear.delete(n.id)
        else this.appear.set(n.id, t)
      }
    }
  }

  // El socket late mientras espera un patrón; al enchufar toma el color de la familia del patrón.
  private drawSocket(d: Graphics, gl: Graphics, time: number) {
    const s = this.session
    const at = this.socketPoint()
    this.socketLabel.visible = false
    const plugged = s.variant.socket?.pattern
    if (!at || !s.socket || (!s.inventoryOpen && !plugged)) return
    const color = plugged ? FAMILY_COLORS[PATTERNS[plugged].family] : C.violet
    const waiting = !plugged && s.inventoryOpen
    const beat = 0.5 + 0.5 * Math.sin(time / (waiting ? 220 : 500))
    const r = SOCKET_R * (this.dropHover ? 1.35 : 1) + (waiting ? beat * 1.5 : 0)
    const hex = hexagon(at, r)

    const anchor = nodeCenter(s.level.circuit.nodes.find((n) => n.id === s.socket!.at)!)
    d.moveTo(at.x, at.y + r).lineTo(anchor.x, anchor.y - NODE_H / 2).stroke({ width: 2, color, alpha: 0.6 })
    d.poly(hex).fill({ color: plugged ? color : C.bg, alpha: plugged ? 0.9 : 1 }).stroke({ width: 2, color })
    gl.poly(hex).stroke({ width: 6, color, alpha: 0.35 + beat * 0.5 + (this.dropHover ? 0.4 : 0) })
    if (waiting) {
      d.moveTo(at.x - 5, at.y).lineTo(at.x + 5, at.y).moveTo(at.x, at.y - 5).lineTo(at.x, at.y + 5).stroke({ width: 2, color })
      gl.circle(at.x, at.y, r + 10 + beat * 8).stroke({ width: 2, color, alpha: 0.3 * (1 - beat) })
    }
    this.socketLabel.text = plugged ? PATTERNS[plugged].name : this.dropHover ? 'suéltalo aquí' : s.socket.label
    this.socketLabel.style.fill = color
    this.socketLabel.position.set(at.x, at.y - r - 6)
    this.socketLabel.visible = true
  }

  private drawDrag(d: Graphics, gl: Graphics) {
    if (!this.drag) return
    const from = outPort(this.session.playback.circuit.nodes.get(this.drag.from)!)
    d.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 3, color: C.green, cap: 'round' })
    gl.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 8, color: C.green, alpha: 0.6 })
    d.circle(this.drag.to.x, this.drag.to.y, 5).fill({ color: C.green })
  }

  private drawPulses(ctx: DrawContext) {
    const { d, gl } = ctx
    const pb = this.session.playback
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
      drawShape(d, p.shape, pos, 7, color)
      d.circle(pos.x, pos.y, 2.6).fill({ color: 0xffffff })

      const visited = p.trail.map((id) => pb.circuit.nodes.get(id)).filter((n): n is NodeDef => !!n?.skin)
      for (const pattern of new Set(visited.map((n) => n.skin!))) {
        this.skins[pattern]?.drawPulse?.(ctx, p, pos, visited.filter((n) => n.skin === pattern))
      }

      if (pb.followed === p.id) {
        this.followLabel.text = `#${p.id}${p.label ? ` · ${p.label}` : ''}`
        this.followLabel.position.set(pos.x, pos.y - 16)
        this.followLabel.visible = true
        d.circle(pos.x, pos.y, 12).stroke({ width: 1.5, color: C.white, alpha: 0.9 })
        gl.circle(pos.x, pos.y, 14).stroke({ width: 3, color: C.white, alpha: 0.5 })
      }
    }
  }
}

function label(text: string, size: number, fill: number, fontFamily = FONT_UI, fontWeight: '400' | '600' | '700' = '600') {
  return new Text({ text, style: { fontFamily, fontSize: size, fontWeight, fill } })
}

// El árbol de if/elsif: una rama por caso más el `else` que pierde pedidos.
function drawBranchGlyph(d: Graphics, p: Point, cases: number) {
  const x0 = p.x - NODE_W / 2 + 12
  for (let i = 0; i <= cases; i++) {
    const y = p.y - 12 + i * (24 / cases)
    d.moveTo(x0, p.y).lineTo(x0 + 7, y).lineTo(x0 + 12, y).stroke({ width: 1.5, color: i === cases ? C.red : C.amber, alpha: 0.9 })
  }
}

// La forma del pulso dice qué tipo de dato es: ● pedido, ■ pago, ▲ evento, ◆ producto.
function drawShape(d: Graphics, shape: PulseShape, p: Point, r: number, color: number) {
  if (shape === 'square') d.roundRect(p.x - r, p.y - r, r * 2, r * 2, 2).fill({ color })
  else if (shape === 'triangle') d.poly([p.x, p.y - r * 1.15, p.x + r, p.y + r * 0.8, p.x - r, p.y + r * 0.8]).fill({ color })
  else if (shape === 'diamond') d.poly([p.x, p.y - r * 1.2, p.x + r * 1.2, p.y, p.x, p.y + r * 1.2, p.x - r * 1.2, p.y]).fill({ color })
  else d.circle(p.x, p.y, r * 0.93).fill({ color })
}

const hexagon = (c: Point, r: number) =>
  Array.from({ length: 6 }, (_, i) => [c.x + r * Math.cos((Math.PI / 3) * i + Math.PI / 6), c.y + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)]).flat()

const easeOutBack = (t: number) => {
  const c = 1.70158
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}

function dashed(g: Graphics, a: Point, b: Point, color: number, alpha: number) {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const ux = (b.x - a.x) / len
  const uy = (b.y - a.y) / len
  for (let t = 0; t < len; t += 13) {
    const e = Math.min(t + 7, len)
    g.moveTo(a.x + ux * t, a.y + uy * t).lineTo(a.x + ux * e, a.y + uy * e)
  }
  g.stroke({ width: 3, color, alpha, cap: 'round' })
}
