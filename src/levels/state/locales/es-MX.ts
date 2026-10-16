import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'La vida de un pedido',
  'brief.problem': 'Un pedido pasa por pendiente → pagado → preparando → entregado. El código cambia el status con cada evento sin preguntar: se "entrega" antes de preparar y se cancela algo ya entregado.',
  'brief.goal': 'Que un evento que no tiene sentido en el estado actual se rechace, sin llenar de ifs cada método.',
  'node.events': 'Eventos',
  'node.order': 'Pedido',
  'node.history': 'Historial',
  'socket.states': 'Estados',
  'option.states.state.title': 'State: el comportamiento cambia con el estado',
  'option.states.state.body': 'Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva. El pedido delega en su estado actual: lo que no tiene sentido se rechaza sin un solo if repartido.',
  'option.states.strategy.title': 'Strategy la elige quien llama; en State decide el estado actual',
  'option.states.strategy.body': 'Una estrategia por evento reparte el código, pero la elige quien llama y ninguna sabe en qué estado está el pedido: cada una aplica su cambio igual. En State decide el estado actual, y normalmente él mismo indica el siguiente.',
  'option.states.command.title': 'Command ordena y guarda, no valida',
  'option.states.command.body': 'Convertir los eventos en comandos encolados permite postergarlos o deshacerlos, pero la cola los ejecuta igual: el pedido sigue sin saber qué eventos tienen sentido.',
  'win.0': 'eventos fuera de orden registrados',
  'scenario.main.0': 'pagar',
  'scenario.main.1': 'entregar',
  'scenario.main.2': 'preparar',
  'scenario.main.3': 'entregar',
  'scenario.main.4': 'cancelar',
  'node.reject': 'Rechazar evento',
  'node.reject.message': '✋ evento rechazado',
  'node.queue': 'Cola de eventos',
  'state.pending': 'pendiente',
  'state.paid': 'pagado',
  'state.preparing': 'preparando',
  'state.delivered': 'entregado',
  'state.cancelled': 'cancelado',
}

export default texts
