import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'El proveedor se cayó',
  'brief.problem': 'El proveedor de pagos está caído. Cada cobro espera el timeout completo y falla: los pedidos se pierden y la fila no avanza.',
  'brief.goal': 'Que nadie se quede sin su pedido y que, una vez claro que el proveedor está caído, no se lo siga esperando.',
  'node.gateway': 'Proveedor (caído)',
  'socket.provider': 'Proveedor',
  'option.provider.circuit-breaker.title': 'Circuit Breaker: dejar de insistir',
  'option.provider.circuit-breaker.body': 'El interruptor cuenta los fallos. Tras dos seguidos se abre: los siguientes cobros van directo al respaldo, sin esperar el timeout. Pasado un tiempo probaría una llamada ("medio abierto") para ver si el proveedor volvió.',
  'option.provider.chain-of-responsibility.title': 'Un respaldo sin memoria',
  'option.provider.chain-of-responsibility.body': 'Pasar al pago offline cuando el proveedor falla salva los pedidos, pero cada cliente espera el timeout completo: la cadena nunca aprende que el proveedor está caído. El interruptor sí lo recuerda.',
  'option.provider.proxy.title': 'Un proxy que solo reenvía no protege',
  'option.provider.proxy.body': 'Este proxy le pasa cada cobro al proveedor caído y espera el mismo timeout. Un Circuit Breaker es, de hecho, un proxy con memoria de fallos.',
  'win.1': 'clientes que esperaron el timeout',
  'scenario.main.0': 'Pedido 1',
  'scenario.main.1': 'Pedido 2',
  'scenario.main.2': 'Pedido 3',
  'scenario.main.3': 'Pedido 4',
  'scenario.main.4': 'Pedido 5',
  'scenario.main.5': 'Pedido 6',
  'scenario.main.6': 'Pedido 7',
  'scenario.main.7': 'Pedido 8',
  'node.breaker': 'Interruptor',
  'node.markTimeout': 'Timeout',
  'node.offline': 'Pago offline',
}

export default texts
