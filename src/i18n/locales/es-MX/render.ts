import type { render as source } from '../en/render'

export const render: Record<keyof typeof source, string> = {
  // nodes
  'render.node.actor': 'actor',

  // pulses
  'render.pulse.order': 'pedido',

  // sockets
  'render.socket.dropHere': 'suéltalo aquí',
  'render.socket.plugged': '{pattern} enchufado',

  // floating texts
  'render.fx.connected': '¡conectado!',
  'render.fx.uselessWire': 'ese cable no resuelve nada aquí',
  'render.fx.orderLost': '¡pedido perdido! · {reason}',
  'render.fx.chargedAgain': '¡cobrado otra vez!',
  'render.fx.delivered': '☕ {label} entregado',
  'render.fx.invalid': '¡esto no es lo que pedí!',

  // drop reasons
  'render.drop.noWire': 'sin cable de salida',
  'render.drop.unhandled': 'nadie lo maneja (else)',
  'render.drop.guard': 'rechazado',

  // skins
  'render.skin.behavioral.undone': '↶ deshecho',
  'render.skin.behavioral.notMine': 'no me toca → siguiente',
  'render.skin.behavioral.handled': '✓ lo atiendo',
  'render.skin.resilience.breakerOpen': '⚡ interruptor abierto: directo al respaldo',
  'render.skin.resilience.compensated': '↩ compensado',
  'render.skin.structural.fromProxy': '↩ desde el proxy',
}
