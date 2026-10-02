import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'El proveedor se cayó': 'The provider went down',
  'El proveedor de pagos está caído. Cada cobro espera el timeout completo y falla: los pedidos se pierden y la fila no avanza.': 'The payment provider is down. Every charge waits for the full timeout and fails: orders get lost and the line doesn\'t move.',
  'Que nadie se quede sin su pedido y que, una vez claro que el proveedor está caído, no se lo siga esperando.': 'Make sure nobody is left without their order and that, once it\'s clear the provider is down, nobody keeps waiting on it.',
  'Cliente': 'Customer',
  'Cobrar': 'Charge',
  'Proveedor (caído)': 'Provider (down)',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Interruptor': 'Breaker',
  'Timeout': 'Timeout',
  'Pago offline': 'Offline payment',
  'Proveedor': 'Provider',
  'Circuit Breaker: dejar de insistir': 'Circuit Breaker: stop retrying',
  'El interruptor cuenta los fallos. Tras dos seguidos se abre: los siguientes cobros van directo al respaldo, sin esperar el timeout. Pasado un tiempo probaría una llamada ("medio abierto") para ver si el proveedor volvió.': 'The breaker counts failures. After two in a row it opens: the next charges go straight to the fallback, without waiting for the timeout. After a while it would try one call ("half-open") to see if the provider is back.',
  'Un respaldo sin memoria': 'A fallback with no memory',
  'Pasar al pago offline cuando el proveedor falla salva los pedidos, pero cada cliente espera el timeout completo: la cadena nunca aprende que el proveedor está caído. El interruptor sí lo recuerda.': 'Switching to offline payment when the provider fails saves the orders, but every customer waits for the full timeout: the chain never learns the provider is down. The breaker does remember.',
  'Un proxy que solo reenvía no protege': 'A proxy that only forwards doesn\'t protect',
  'Este proxy le pasa cada cobro al proveedor caído y espera el mismo timeout. Un Circuit Breaker es, de hecho, un proxy con memoria de fallos.': 'This proxy passes every charge to the downed provider and waits the same timeout. A Circuit Breaker is, in fact, a proxy with a memory of failures.',
  'clientes que esperaron el timeout': 'customers who waited for the timeout',
  'Pedido 1': 'Order 1',
  'Pedido 2': 'Order 2',
  'Pedido 3': 'Order 3',
  'Pedido 4': 'Order 4',
  'Pedido 5': 'Order 5',
  'Pedido 6': 'Order 6',
  'Pedido 7': 'Order 7',
  'Pedido 8': 'Order 8',
}

export default en
