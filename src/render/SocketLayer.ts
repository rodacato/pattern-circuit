import { Container, type Graphics, type Text } from 'pixi.js'
import { PATTERNS, type Point } from '../engine'
import type { GameSession } from '../game/session/GameSession'
import { hexagon, label } from './draw'
import type { Effects } from './fx'
import { NODE_H, nodeCenter, SOCKET_R, socketCenter, withinSocket } from './layout'
import { FAMILY_COLORS, NEON as C } from './theme'

// Sockets hexagonales: laten mientras esperan un patrón y toman el color de la familia del enchufado.
export class SocketLayer {
  readonly container = new Container()
  dropHover?: string
  private readonly labels = new Map<string, Text>()
  private readonly lastPlugs: Record<string, string> = {}
  private readonly session: GameSession
  private readonly fx: Effects

  constructor(session: GameSession, fx: Effects) {
    this.session = session
    this.fx = fx
  }

  point(socketId: string): Point | undefined {
    const socket = this.session.sockets.find((s) => s.id === socketId)
    return socket && socketCenter(this.session.level.circuit.nodes, socket.at)
  }

  at(p: Point): string | undefined {
    return this.session.sockets.find((s) => {
      const at = this.point(s.id)
      return at && withinSocket(at, p)
    })?.id
  }

  // Enchufar un patrón: onda y chispas del color de su familia sobre el socket.
  celebrate() {
    for (const [socketId, plug] of Object.entries(this.session.flow.plugs)) {
      if (this.lastPlugs[socketId] === plug.pattern) continue
      this.lastPlugs[socketId] = plug.pattern
      const at = this.point(socketId)
      if (!at) continue
      const color = FAMILY_COLORS[PATTERNS[plug.pattern].family]
      this.fx.ring(at, color, 110)
      this.fx.burst(at, color, 34, 3.2)
      this.fx.float(at, `${PATTERNS[plug.pattern].name} enchufado`, color)
    }
  }

  draw(d: Graphics, gl: Graphics, beatAt: (period: number) => number) {
    const s = this.session
    for (const socket of s.sockets) {
      const text = this.labels.get(socket.id) ?? this.container.addChild(label('', 11, C.violet))
      text.anchor.set(0.5, 1)
      this.labels.set(socket.id, text)
      text.visible = false
      const at = this.point(socket.id)
      const plugged = s.pluggedAt(socket.id)
      if (!at || (!s.inventoryOpen && !plugged)) continue
      const color = plugged ? FAMILY_COLORS[PATTERNS[plugged].family] : C.violet
      const waiting = !plugged && s.inventoryOpen
      const hovered = this.dropHover === socket.id
      const beat = beatAt(waiting ? 220 : 500)
      const r = SOCKET_R * (hovered ? 1.35 : 1) + (waiting ? beat * 1.5 : 0)
      const hex = hexagon(at, r)

      const anchor = nodeCenter(s.level.circuit.nodes.find((n) => n.id === socket.at)!)
      d.moveTo(at.x, at.y + r).lineTo(anchor.x, anchor.y - NODE_H / 2).stroke({ width: 2, color, alpha: 0.6 })
      d.poly(hex).fill({ color: plugged ? color : C.bg, alpha: plugged ? 0.9 : 1 }).stroke({ width: 2, color })
      gl.poly(hex).stroke({ width: 6, color, alpha: 0.35 + beat * 0.5 + (hovered ? 0.4 : 0) })
      if (waiting) {
        d.moveTo(at.x - 5, at.y).lineTo(at.x + 5, at.y).moveTo(at.x, at.y - 5).lineTo(at.x, at.y + 5).stroke({ width: 2, color })
        gl.circle(at.x, at.y, r + 10 + beat * 8).stroke({ width: 2, color, alpha: 0.3 * (1 - beat) })
      }
      text.text = plugged ? PATTERNS[plugged].name : hovered ? 'suéltalo aquí' : socket.label
      text.style.fill = color
      text.position.set(at.x, at.y - r - 6)
      text.visible = true
    }
  }
}
