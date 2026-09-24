import { Application, BlurFilter, Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js'
import { initialNodeState, pointAt, timesDelivered, wirePath, type NodeDef, type PatternId, type Point, type SimEvent } from '../engine'
import type { GameSession } from '../game/session/GameSession'
import { msg, N, type Translate } from '../i18n'
import { dashed, drawBranchGlyph, label } from './draw'
import { Effects } from './fx'
import { coarsePointer, DoubleTap, Pinch } from './gestures'
import { CELL, circuitBounds, nearestPulse, NODE_H, NODE_W, nodeAt, nodeCenter, outPort, toPx, worldTransform, zoomAt, type View } from './layout'
import { NodeAnimations, prefersReducedMotion } from './motion'
import { PulseLayer } from './PulseLayer'
import { createSkins, stateColor, type DrawContext, type Skin } from './skins'
import { SocketLayer } from './SocketLayer'
import { DROP_TEXT, FONT_MONO, FONT_UI, INVALID_TEXT, NEON as C, pulseColor } from './theme'

const PORT_R = 6
const TOUCH = coarsePointer() // con el dedo, los blancos para tocar son más grandes
const PORT_HIT = PORT_R + (TOUCH ? 16 : 6)
const PULSE_HIT = TOUCH ? 30 : 18
const INVENTORY_INSET = 150 // mientras el inventario está abierto, el circuito se encuadra por encima de él

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
  private readonly reduced = prefersReducedMotion()
  private readonly motion = new NodeAnimations(this.reduced)
  private readonly skins: Record<PatternId, Skin> = createSkins()
  private readonly session: GameSession
  private readonly t: Translate
  private readonly fx: Effects
  private readonly pulses: PulseLayer
  private readonly sockets: SocketLayer
  private builtVersion = -1
  private bounds = { w: 0, h: 0 }
  private views = new Map<string, Container>()
  private stateLabels = new Map<string, Text>()
  private hovered?: string
  private drag?: Drag
  private view: View = { zoom: 1, x: 0, y: 0 }
  private panning?: { x: number; y: number }
  private time = 0

  private constructor(session: GameSession, t: Translate) {
    this.session = session
    this.t = t
    this.fx = new Effects(this.fxLayer, this.reduced, t)
    this.pulses = new PulseLayer(this.skins, t)
    this.sockets = new SocketLayer(session, this.fx, t)
  }

  static async create(host: HTMLElement, session: GameSession, t: Translate): Promise<NeonStage> {
    const stage = new NeonStage(session, t)
    await stage.app.init({ resizeTo: host, background: C.bg, antialias: true, resolution: devicePixelRatio, autoDensity: true })
    host.appendChild(stage.app.canvas)

    const glowLayer = new Container()
    glowLayer.addChild(stage.glow)
    glowLayer.filters = [new BlurFilter({ strength: 12, quality: 4 })]
    glowLayer.blendMode = 'add'
    stage.world.addChild(stage.base, glowLayer, stage.dynamic, stage.nodesLayer, stage.pulses.container, stage.fxLayer, stage.sockets.container)
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
    const rect = this.app.canvas.getBoundingClientRect()
    return this.sockets.at(this.world.toLocal({ x: clientX - rect.left, y: clientY - rect.top }))
  }

  setDropHover(socketId: string | undefined) {
    this.sockets.dropHover = socketId
  }

  // --- bucle ---

  private tick(delta: number) {
    const s = this.session
    if (s.circuitVersion !== this.builtVersion) this.build()
    s.update(delta)
    this.time = performance.now()
    const t = worldTransform(this.app.screen, this.bounds, this.view, this.inset())
    this.world.scale.set(t.scale)
    this.world.position.set(t.x, t.y)
    for (const e of s.playback.drainEvents()) this.onEvent(e)

    const d = this.dynamic.clear()
    const gl = this.glow.clear()
    const ctx: DrawContext = { d, gl, time: this.time, circuit: s.playback.circuit, state: s.playback.timeline.current.state }
    this.drawFlow(d)
    this.drawHint(d, gl)
    this.drawNodes(ctx)
    this.sockets.draw(d, gl, (period) => this.beat(period))
    this.drawDrag(d, gl)
    this.pulses.draw(ctx, s.playback)
    this.fx.draw(d, gl)
  }

  // Latido entre 0 y 1; con movimiento reducido queda fijo a media intensidad.
  private beat(period: number) {
    return this.reduced ? 0.5 : 0.5 + 0.5 * Math.sin(this.time / period)
  }

  private skinOf(n: NodeDef): Skin | undefined {
    return n.skin ? this.skins[n.skin] : undefined
  }

  private inset() {
    return this.session.inventoryOpen ? INVENTORY_INSET : 0
  }

  private build() {
    const s = this.session
    this.builtVersion = s.circuitVersion
    this.pulses.clear()
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
    this.stateLabels.clear()
    for (const n of nodes) {
      const view = this.nodeView(n)
      this.views.set(n.id, view)
      this.nodesLayer.addChild(view)
      if (before.size && !before.has(n.id)) this.motion.appear(n.id)
    }
    this.sockets.celebrate()
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

    const title = label(this.t(n.label), 13, C.text, FONT_UI, '600')
    title.anchor.set(0.5, 1)
    title.y = 3
    const sub = label(n.className ?? (n.kind === 'actor' ? this.t('actor') : ''), 10, C.muted, FONT_MONO, '400')
    sub.anchor.set(0.5, 0)
    sub.y = 6
    box.addChild(title, sub)
    if (initialNodeState(n.behavior) !== undefined) {
      const current = label('', 11, C.bg, FONT_UI, '700')
      current.anchor.set(0.5)
      current.y = NODE_H / 2 + 13
      box.addChild(current)
      this.stateLabels.set(n.id, current)
    }

    const port = new Graphics().circle(0, 0, PORT_HIT).fill({ color: 0xffffff, alpha: 0.001 })
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

  // Cámara: rueda o pellizco = zoom hacia el puntero, arrastrar el fondo = mover, doble clic o doble toque = encuadrar.
  private bindPointer() {
    const stage = this.app.stage
    stage.eventMode = 'static'
    stage.hitArea = this.app.screen
    stage.on('globalpointermove', (e: FederatedPointerEvent) => {
      if (this.drag) this.drag.to = this.world.toLocal(e.global)
      if (this.panning) {
        this.view = { ...this.view, x: this.view.x + e.global.x - this.panning.x, y: this.view.y + e.global.y - this.panning.y }
        this.panning = { x: e.global.x, y: e.global.y }
      }
    })
    const end = () => {
      this.endDrag()
      this.panning = undefined
    }
    stage.on('pointerup', end)
    stage.on('pointerupoutside', end)
    stage.on('pointerdown', (e: FederatedPointerEvent) => {
      const id = nearestPulse(this.pulses.positions, this.world.toLocal(e.global), PULSE_HIT)
      if (id !== undefined) this.session.follow(id)
      else if (e.target === stage) this.panning = { x: e.global.x, y: e.global.y }
    })
    const canvas = this.app.canvas
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        const rect = canvas.getBoundingClientRect()
        const pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top }
        this.view = zoomAt(this.app.screen, this.bounds, this.view, pointer, Math.exp(-e.deltaY * 0.0015), this.inset())
      },
      { passive: false },
    )
    canvas.addEventListener('dblclick', () => this.reframe())
    this.bindTouch(canvas)
  }

  // Dos dedos: zoom alrededor del punto medio (y cancela el paneo de un dedo). Doble toque: encuadrar.
  private bindTouch(canvas: HTMLCanvasElement) {
    const pinch = new Pinch()
    const doubleTap = new DoubleTap()
    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return
      pinch.down(e.pointerId, local(e))
      if (pinch.active) this.panning = undefined
    })
    canvas.addEventListener('pointermove', (e) => {
      const zoom = e.pointerType === 'touch' ? pinch.move(e.pointerId, local(e)) : undefined
      if (zoom) this.view = zoomAt(this.app.screen, this.bounds, this.view, zoom.center, zoom.factor, this.inset())
    })
    const lift = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      const wasPinch = pinch.active
      pinch.up(e.pointerId)
      if (!wasPinch && e.type === 'pointerup' && doubleTap.tap(e.timeStamp, local(e))) this.reframe()
    }
    canvas.addEventListener('pointerup', lift)
    canvas.addEventListener('pointercancel', lift)
  }

  private reframe() {
    this.view = { zoom: 1, x: 0, y: 0 }
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

  private onEvent(e: SimEvent) {
    const s = this.session
    const node = 'nodeId' in e ? s.playback.circuit.nodes.get(e.nodeId) : undefined
    if (!node) return
    const at = nodeCenter(node)
    const state = s.playback.timeline.current.state
    const pulse = 'pulseId' in e ? state.pulses.find((p) => p.id === e.pulseId) : undefined
    this.skinOf(node)?.onEvent?.({ fx: this.fx, circuit: s.playback.circuit, pulse }, node, at, e)
    const color = pulse ? pulseColor(pulse.tags) : C.cyan
    switch (e.type) {
      case 'pulse.enter':
        this.motion.flash(e.nodeId, color)
        break
      case 'pulse.branch':
        this.motion.flash(e.nodeId, e.branch === 'else' ? C.red : C.violet, 1.4)
        break
      case 'pulse.drop':
        this.fx.burst(at, C.red, 28, 3.4)
        this.motion.shake(e.nodeId, 1)
        this.fx.float(at, msg('¡pedido perdido! · {reason}', { reason: DROP_TEXT[e.reason] }), C.red)
        this.pulses.forget(e.pulseId)
        break
      case 'pulse.deliver': {
        const dup = timesDelivered(state, e.nodeId, pulse!.originId) > 1
        const tone = !e.valid ? C.red : dup ? C.amber : C.green
        const message = node.behavior.type === 'sink' ? node.behavior.message : undefined
        const text = !e.valid ? INVALID_TEXT : dup ? N('¡cobrado otra vez!') : (message ?? msg('☕ {label} entregado', { label: pulse?.label ?? N('pedido') }))
        this.fx.burst(at, tone, 20, 2.4)
        this.fx.float(at, text, tone)
        if (!e.valid) this.motion.shake(e.nodeId, 0.7)
        this.pulses.forget(e.pulseId)
        break
      }
      case 'pulse.clone':
        this.fx.burst(at, C.amber, 10, 1.6)
        break
      case 'pulse.merge':
      case 'pulse.cancel':
        this.pulses.forget(e.pulseId)
        break
    }
  }

  // Los cables "fluyen" en la dirección de la dependencia; con movimiento reducido quedan quietos.
  private drawFlow(d: Graphics) {
    for (const w of this.session.playback.circuit.wires.values()) {
      const abstract = w.dep === 'abstract'
      const step = 0.45 / w.length
      const offset = this.reduced ? 0 : ((this.time / 1000) * 0.6) / w.length
      for (let t = offset % step; t < 1; t += step) {
        const a = toPx(pointAt(w.path, t))
        const b = toPx(pointAt(w.path, Math.min(1, t + step * (abstract ? 0.35 : 0.2))))
        d.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ width: 2, color: abstract ? C.violet : C.cyan, alpha: 0.55, cap: 'round' })
      }
    }
  }

  // Tras un intento fallido, un cable fantasma sugiere la reparación pendiente.
  private drawHint(d: Graphics, gl: Graphics) {
    const s = this.session
    if (!s.failedRuns || this.drag) return
    const beat = this.beat(260)
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
    const { d, gl } = ctx
    const s = this.session
    const connecting = s.pendingRepairs.length > 0
    for (const n of s.playback.circuit.nodes.values()) {
      const { flash: f, shake, grow } = this.motion.sample(n.id)
      const base = nodeCenter(n)
      const p = { x: base.x + Math.sin(this.time / 18) * shake * 5, y: base.y }
      const view = this.views.get(n.id)!
      view.position.set(p.x, p.y)
      view.scale.set(grow)
      view.alpha = Math.min(1, grow)

      const touched = s.touched.includes(n.id)
      const selected = s.playback.inspected === n.id
      const hover = this.hovered === n.id || (!!this.drag && !!nodeAt([n], this.drag.to))
      const beat = touched ? this.beat(180) : 0
      const color = touched ? C.red : n.behavior.type === 'slot' ? C.violet : n.kind === 'actor' || n.kind === 'external' ? C.amber : C.cyan
      const scale = grow * (1 + (f ? f.t * 0.06 : 0) + (hover ? 0.03 : 0))
      const w = NODE_W * scale
      const h = NODE_H * scale
      const x = p.x - w / 2
      const y = p.y - h / 2

      d.roundRect(x, y, w, h, 12).fill({ color: C.panel, alpha: 0.94 * Math.min(1, grow) })
      d.roundRect(x, y, w, h, 12).stroke({ width: selected ? 3 : 2, color: selected ? C.white : f ? f.color : color, alpha: 0.95 })
      gl.roundRect(x, y, w, h, 12).stroke({ width: 5, color: f ? f.color : color, alpha: 0.3 + (f ? f.t * 0.5 : 0) + beat * 0.6 + (hover ? 0.3 : 0) })

      if (n.kind === 'external') dashed(d, { x: x + 10, y: y - 5 }, { x: x + w - 10, y: y - 5 }, C.amber, 0.6)
      this.drawNodeState(d, gl, n, p, h)
      if (grow >= 1) this.skinOf(n)?.drawNode?.(ctx, n, p)
      if (n.behavior.type === 'branch') drawBranchGlyph(d, p, Object.keys(n.behavior.cases).length)
      if (connecting && n.behavior.type !== 'sink') {
        const pr = PORT_R * (this.drag?.from === n.id ? 1.4 : 1)
        d.circle(p.x + w / 2, p.y, pr).fill({ color: C.bg }).stroke({ width: 2, color: C.green })
        gl.circle(p.x + w / 2, p.y, pr + 2).fill({ color: C.green, alpha: 0.35 })
      }

      const pips = Math.min(ctx.state.load[n.id] ?? 0, 6)
      for (let i = 0; i < pips; i++) d.circle(p.x - (pips - 1) * 5 + i * 10, p.y + h / 2 + 9, 2.5).fill({ color: C.amber })
      this.motion.advance(n.id)
    }
  }

  // Máquinas e interruptores muestran su estado actual en una etiqueta del color de ese estado.
  private drawNodeState(d: Graphics, gl: Graphics, n: NodeDef, p: Point, h: number) {
    const text = this.stateLabels.get(n.id)
    if (!text) return
    const current = this.session.playback.timeline.current.state.nodeState[n.id] ?? initialNodeState(n.behavior)!
    const color = stateColor(current)
    text.text = this.t(current)
    const w = text.width + 16
    d.roundRect(p.x - w / 2, p.y + h / 2 + 4, w, 18, 9).fill({ color })
    gl.roundRect(p.x - w / 2, p.y + h / 2 + 4, w, 18, 9).fill({ color, alpha: 0.5 })
  }

  private drawDrag(d: Graphics, gl: Graphics) {
    if (!this.drag) return
    const from = outPort(this.session.playback.circuit.nodes.get(this.drag.from)!)
    d.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 3, color: C.green, cap: 'round' })
    gl.moveTo(from.x, from.y).lineTo(this.drag.to.x, this.drag.to.y).stroke({ width: 8, color: C.green, alpha: 0.6 })
    d.circle(this.drag.to.x, this.drag.to.y, 5).fill({ color: C.green })
  }
}
