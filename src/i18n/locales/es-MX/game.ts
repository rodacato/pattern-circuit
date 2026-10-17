import type { game as source } from '../en/game'

export const game: Record<keyof typeof source, string> = {
  // hints
  'game.hints.socketSuffix': ' (socket "{socket}")',
  'game.hints.question.fallback': 'Corre el circuito y sigue un pulso: ¿dónde se tuerce el recorrido?',
  'game.hints.question.dropped': '¿Por qué se pierden pedidos? Sigue uno con clic y mira en qué nodo desaparece.',
  'game.hints.question.invalidAtSink': '¿Llegan pedidos equivocados? Sigue uno con clic y mira en qué nodo se le pega lo que no debía, o le falta lo que sí.',
  'game.hints.question.duplicatesAtSink': '¿Algo ocurre más de una vez? Pregúntate si hay que avisar a todos o elegir uno.',
  'game.hints.question.nodesTouched': '¿El cambio obliga a abrir piezas que ya funcionaban? Busca dónde podría enchufarse lo nuevo sin tocarlas.',
  'game.hints.question.nodes': '¿Hace falta cada pieza que agregas? Busca el arreglo más chico que funcione.',
  'game.hints.question.maxLoad': '¿Alguien carga con trabajo de más o espera sin necesidad?',
  'game.hints.question.cancelled': '¿Se puede detener algo antes de que ocurra?',
  'game.hints.question.delivered': '¿Por qué no llegan todos los pedidos al cliente? Sigue un pulso con clic.',
  'game.hints.family': 'El patrón que buscas{where} es de la familia {family}: {detail}.',
  'game.hints.principle': 'Lo que buscas{where} no es un patrón sino un principio: a veces la mejor pieza es la que no agregas.',
  'game.hints.familyDetail.creational': 'los creacionales, que se ocupan de cómo se crean los objetos',
  'game.hints.familyDetail.structural': 'los estructurales, que se ocupan de cómo se componen clases y objetos',
  'game.hints.familyDetail.behavioral': 'los de comportamiento, que reparten responsabilidades y definen cómo interactúan los objetos',
  'game.hints.familyDetail.architecture': 'los de arquitectura, que ordenan componentes enteros y cómo se comunican',
  'game.hints.familyDetail.resilience': 'los de resiliencia, que deciden qué hacer cuando otro servicio falla',
  'game.hints.familyDetail.principle': 'los principios: a veces la mejor pieza es la que no agregas',
  'game.hints.ruleOut': 'Descarta {pattern}{where}: no encaja con este problema.',
  'game.hints.answer': 'Prueba con {pattern}{where}.',
  // predictions
  'game.prediction.outcome.solves': 'Resuelve el problema',
  'game.prediction.outcome.partial': 'Ayuda en parte, pero no basta',
  'game.prediction.outcome.misfit': 'No encaja aquí',
  'game.prediction.touched.none': 'Ninguna: solo se agrega algo nuevo',
  'game.prediction.touched.one': 'Una',
  'game.prediction.touched.many': 'Más de una',
  'game.prediction.outcomeQuestion': 'Antes de correrlo: ¿qué hará {pattern} en este socket?',
  'game.prediction.touchedQuestion': '¿Cuántas piezas que ya funcionaban habrá que modificar para cumplir el ticket?',
  // code diff
  'game.diff.ticketWith': 'Lo que cambió con el ticket, con {names}',
  'game.diff.ticketWithout': 'Lo que cambió con el ticket, sin patrón',
  'game.diff.withoutToWith': 'Del código sin patrón al código con {names}',
  // several pattern names in a row
  'game.names.join': '{head} + {tail}',
}
