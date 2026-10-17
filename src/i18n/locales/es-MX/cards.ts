import type { cards as source } from '../en/cards'

export const cards: Record<keyof typeof source, string> = {
  // metrics (also used as the label of an assertion that has none)
  'cards.metrics.spawned': 'pedidos creados',
  'cards.metrics.delivered': 'pedidos entregados',
  'cards.metrics.dropped': 'pedidos perdidos',
  'cards.metrics.invalidAtSink': 'pedidos equivocados',
  'cards.metrics.duplicatesAtSink': 'pedidos duplicados',
  'cards.metrics.cancelled': 'pedidos cancelados a tiempo',
  'cards.metrics.maxLoad': 'carga máxima de un nodo',
  'cards.metrics.nodesTouched': 'nodos existentes modificados',
  'cards.metrics.nodes': 'piezas en el circuito',

  // how an assertion compares its value
  'cards.expectation.equal': 'debía ser',
  'cards.expectation.atMost': 'máximo',
  'cards.expectation.atLeast': 'mínimo',

  // outcome of a tried pattern
  'cards.outcome.solves': '¡Resuelve!',
  'cards.outcome.partial': 'Parcial',
  'cards.outcome.misfit': 'No encaja',

  // shared
  'cards.close': 'Cerrar',

  // failed run
  'cards.stage.fail.title': 'Algo salió mal',
  'cards.stage.fail.retry': 'Reintentar',
  'cards.stage.fail.connect': 'Conectar {from} → {to} sin arrastrar',

  // hints
  'cards.stage.hints.first': 'Quiero una pista',
  'cards.stage.hints.another': 'Otra pista',

  // problem found
  'cards.stage.problem.title': 'Problema detectado',
  'cards.stage.problem.instruction': 'Arrastra un patrón del inventario al socket ⬡ que late sobre el circuito (o elígelo con clic o teclado). Probar uno equivocado también enseña.',

  // prediction
  'cards.stage.predict.title': 'Predice',
  'cards.stage.predict.skip': 'Saltar y ver qué pasa',
  'cards.stage.predict.right': 'Acertaste tu predicción',
  'cards.stage.predict.wrong': 'Predijiste "{guess}"; fue "{answer}"',

  // note after plugging a pattern
  'cards.stage.note.nextTicket': 'Siguiente: llega un cambio →',
  'cards.stage.note.nextCompare': 'Comparar sin/con patrón →',
  'cards.stage.note.pending': 'Este socket quedó resuelto. Falta: {pending}.',
  'cards.stage.note.tryAnother': 'Prueba otro patrón del inventario.',

  // change ticket
  'cards.stage.ticket.title': 'Ticket de cambio',
  'cards.stage.ticket.skipPrediction': 'Aplicar sin predecir',
  'cards.stage.ticket.apply': 'Aplicar el cambio',
  'cards.stage.ticket.opened': 'Hubo que abrir código que ya funcionaba.',
  'cards.stage.ticket.withinLimit': 'Se abrió solo lo que este nivel permite (hasta {allowed}): la pieza que concentra el cambio.',
  'cards.stage.ticket.added': 'Solo se agregó una pieza nueva: ningún nodo existente cambió su comportamiento.',
  'cards.stage.ticket.compare': 'Comparar sin/con patrón →',

  // comparison
  'cards.comparison.title': 'Comparación',
  'cards.comparison.without': 'Sin patrón',
  'cards.comparison.with': 'Con {names}',
  'cards.comparison.withoutShort': 'sin',
  'cards.comparison.withShort': 'con',
  'cards.comparison.finish': 'Terminar nivel ✓',

  // level complete
  'cards.win.finishedGame': '¡Completaste el recorrido final!',
  'cards.win.learned': 'Resolviste con {names}',
  'cards.win.cafeWorks': '¡La cafetería funciona!',
  'cards.win.levelDone': 'Nivel superado',
  'cards.win.endOfTour': 'Fin del recorrido',
  'cards.win.endBody': 'La cafetería entera corre sobre varios de los patrones del recorrido. Tu cuaderno guarda lo que probaste con cada uno, también lo que no encajó.',
  'cards.win.again': 'Ver de nuevo',
  'cards.win.next': 'Siguiente nivel →',
}
