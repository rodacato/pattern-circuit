import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'La vida de un pedido': 'The life of an order',
  'Un pedido pasa por pendiente → pagado → preparando → entregado. El código cambia el status con cada evento sin preguntar: se "entrega" antes de preparar y se cancela algo ya entregado.':
    'An order goes through pending → paid → preparing → delivered. The code changes the status on every event without asking: it gets "delivered" before being prepared, and something already delivered gets cancelled.',
  'Que un evento que no tiene sentido en el estado actual se rechace, sin llenar de ifs cada método.':
    'Reject any event that makes no sense in the current state, without filling every method with ifs.',
  'Eventos': 'Events',
  'Pedido': 'Order',
  'Historial': 'History',
  'Rechazar evento': 'Reject event',
  'Cola de eventos': 'Event queue',
  '✋ evento rechazado': '✋ event rejected',
  'pendiente': 'pending',
  'pagado': 'paid',
  'preparando': 'preparing',
  'entregado': 'delivered',
  'cancelado': 'cancelled',
  'Estados': 'States',
  'State: el comportamiento cambia con el estado': 'State: behavior changes with the state',
  'Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva. El pedido delega en su estado actual: lo que no tiene sentido se rechaza sin un solo if repartido.':
    'Each state is an object that knows which events it accepts and which state they lead to. The order delegates to its current state: whatever makes no sense is rejected without a single scattered if.',
  'Strategy la elige quien llama; en State decide el estado actual': 'In Strategy the caller picks; in State the current state decides',
  'Una estrategia por evento reparte el código, pero la elige quien llama y ninguna sabe en qué estado está el pedido: cada una aplica su cambio igual. En State decide el estado actual, y normalmente él mismo indica el siguiente.':
    'One strategy per event splits up the code, but the caller picks it and none of them knows what state the order is in: each one applies its change anyway. In State the current state decides, and it usually names the next one itself.',
  'Command ordena y guarda, no valida': 'Command orders and stores, it doesn\'t validate',
  'Convertir los eventos en comandos encolados permite postergarlos o deshacerlos, pero la cola los ejecuta igual: el pedido sigue sin saber qué eventos tienen sentido.':
    'Turning events into queued commands lets you delay or undo them, but the queue runs them anyway: the order still doesn\'t know which events make sense.',
  'eventos fuera de orden registrados': 'out-of-order events recorded',
  'pagar': 'pay',
  'entregar': 'deliver',
  'preparar': 'prepare',
  'cancelar': 'cancel',
}

export default en
