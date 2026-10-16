// Texts of the render area. Keys are `render.<element>`; the other locales must define exactly the same ones.
export const render = {
  // nodes
  'render.node.actor': 'actor',

  // pulses
  'render.pulse.order': 'order',

  // sockets
  'render.socket.dropHere': 'drop it here',
  'render.socket.plugged': '{pattern} plugged in',

  // floating texts
  'render.fx.connected': 'connected!',
  'render.fx.uselessWire': "that wire doesn't fix anything here",
  'render.fx.orderLost': 'order lost! · {reason}',
  'render.fx.chargedAgain': 'charged again!',
  'render.fx.delivered': '☕ {label} delivered',
  'render.fx.invalid': "this isn't what I ordered!",

  // drop reasons
  'render.drop.noWire': 'no outgoing wire',
  'render.drop.unhandled': 'nobody handles it (else)',
  'render.drop.guard': 'rejected',

  // skins
  'render.skin.behavioral.undone': '↶ undone',
  'render.skin.behavioral.notMine': 'not mine → next',
  'render.skin.behavioral.handled': "✓ I'll handle it",
  'render.skin.resilience.breakerOpen': '⚡ breaker open: straight to the fallback',
  'render.skin.resilience.compensated': '↩ compensated',
  'render.skin.structural.fromProxy': '↩ from the proxy',
} as const
