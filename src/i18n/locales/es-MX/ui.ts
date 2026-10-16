import type { ui as source } from '../en/ui'

export const ui: Record<keyof typeof source, string> = {
  // top bar
  'ui.header.language': 'Cambiar idioma',
  'ui.header.reviewHint': 'Repasa problemas de niveles ya completados',
  'ui.header.review': 'Repasar',
  'ui.header.reviewDue': '{n} pendientes',
  'ui.header.notebook': 'Cuaderno',
  'ui.header.notes': '{n} notas',
  'ui.header.level': 'Nivel',
  'ui.stage.circuit': 'Circuito del nivel {n}: {title}',
  'ui.app.desktopOnly': 'Pattern Circuit necesita una pantalla más ancha: ábrelo en una tablet, una computadora o gira el teléfono.',

  // shared
  'ui.common.levelTitle': 'Nivel {n} · {title}',

  // legend
  'ui.legend.order': 'pedido',
  'ui.legend.concrete': 'depende de una clase concreta',
  'ui.legend.interface': 'depende de una interfaz',
  'ui.legend.cameraMouse': 'rueda: zoom · arrastrar el fondo: mover · doble clic: encuadrar · espacio, ←, →, R: reproducción',
  'ui.legend.cameraTouch': 'pellizca: zoom · arrastra el fondo: mover · doble toque: encuadrar',

  // brief card
  'ui.brief.eyebrow': 'Nivel {n} · {chapter}',
  'ui.brief.goal': 'Objetivo',
  'ui.brief.stage.observe': 'Observar',
  'ui.brief.stage.choose': 'Elegir patrón',
  'ui.brief.stage.change': 'Cambio',
  'ui.brief.stage.compare': 'Comparar',

  // inventory
  'ui.inventory.wrongSocket': '{pattern} no va en ese socket',
  'ui.inventory.groupLabel': 'Inventario de patrones',
  'ui.inventory.title': 'Inventario',
  'ui.inventory.tried': 'probado: {outcome}',
  'ui.inventory.hintMany': 'Arrastra cada patrón a su socket ⬡',
  'ui.inventory.hintOne': 'Arrastra un patrón al socket ⬡',
  'ui.inventory.outcome.solves': 'resuelve',
  'ui.inventory.outcome.partial': 'parcial',
  'ui.inventory.outcome.misfit': 'no encaja',

  // notebook
  'ui.notebook.confirmReset': '¿Borrar todo el progreso? Se pierden los niveles completados y las notas del cuaderno.',
  'ui.notebook.eyebrow': 'Cuaderno de patrones',
  'ui.notebook.title': '{n} notas de campo',
  'ui.notebook.predictions': 'Predicciones acertadas: {right} de {total}',
  'ui.notebook.close': 'Cerrar cuaderno',
  'ui.notebook.empty': 'Todavía vacío. Cada patrón que pruebes en un socket deja aquí lo que aprendiste.',
  'ui.notebook.reset': 'Borrar progreso',
  'ui.notebook.outcome.solves': 'Resuelve',
  'ui.notebook.outcome.partial': 'Parcial',
  'ui.notebook.outcome.misfit': 'No encaja',

  // review
  'ui.review.eyebrow': 'Repaso',
  'ui.review.done': 'Ronda terminada',
  'ui.review.question': 'Pregunta {i} de {n}',
  'ui.review.close': 'Cerrar repaso',
  'ui.review.empty': 'Nada pendiente. Los problemas de los niveles que completes vuelven aquí para repasarlos cada vez más espaciados.',
  'ui.review.summary': 'Acertaste {right} de {n}. Los que fallaste vuelven en la próxima ronda; los que acertaste, dentro de unos días.',
  'ui.review.back': 'Volver al juego',
  'ui.review.prompt': '¿Qué patrón enchufarías?',
  'ui.review.correct': 'Correcto',
  'ui.review.answer': 'La respuesta era {pattern}',
  'ui.review.next': 'Siguiente →',
  'ui.review.result': 'Ver resultado',
  'ui.review.socket': 'socket "{label}"',

  // seen in
  'ui.seenIn.label': 'En Ruby: {example}.',
  'ui.seenIn.source': 'Ver fuente ↗',

  // transport
  'ui.transport.label': 'Reproducción',
  'ui.transport.restart.title': 'Reiniciar (R)',
  'ui.transport.restart.label': 'Reiniciar',
  'ui.transport.back.title': 'Paso atrás (←)',
  'ui.transport.back.label': 'Paso atrás',
  'ui.transport.play.title': 'Reproducir / pausa (espacio)',
  'ui.transport.pause': 'Pausa',
  'ui.transport.play': 'Reproducir',
  'ui.transport.forward.title': 'Paso adelante (→)',
  'ui.transport.forward.label': 'Paso adelante',
  'ui.transport.speed': 'Velocidad {s}×',

  // code panel
  'ui.code.view': 'Vista del código',
  'ui.code.tabCode': 'Código',
  'ui.code.tabChanges': 'Cambios',
  'ui.code.diffLabel': '{title}: {added} líneas agregadas, {removed} quitadas',
  'ui.code.unchanged': '{count} líneas sin cambios',
  'ui.code.diffFoot': 'Verde: líneas nuevas. Rojo: líneas que hubo que quitar o cambiar. Mira en qué clases caen.',
  'ui.code.pulse': 'pulso #{id}',
  'ui.code.node': 'nodo · {label}',
  'ui.code.labelRuby': 'Código Ruby del circuito',
  'ui.code.labelTypeScript': 'Código TypeScript del circuito',
  'ui.code.language': 'Lenguaje del código',
  'ui.code.footHint': 'Haz clic en un nodo o en un pulso para seguir su código.',
}
