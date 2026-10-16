import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'La cafetería completa',
  'brief.problem': 'Todo lo que armaste, funcionando junto: el pedido se arma por pasos, se cobra con el cartucho que toca, espera en cola por si lo cancelan, pasa por la cocina y avisa a todos.',
  'brief.goal': 'Recorre la cafetería: sigue un pulso de punta a punta y abre el código de cada patrón.',
  'checklist.play': 'Dale play y mira todo el recorrido',
  'checklist.follow-pulse': 'Haz clic en un pulso para seguirlo de punta a punta',
  'checklist.inspect-node': 'Abre el código de un nodo que te interese',
  'node.size': 'Tamaño',
  'node.build': 'build()',
  'node.notify.message': '✋ rechazado antes de cobrar',
  'node.cash': 'Efectivo',
  'node.card': 'Tarjeta + Adapter',
  'node.app': 'App',
  'node.espresso': 'Máquina',
  'node.ready': 'Pedido listo',
  'node.display.message': '🔔 pantalla',
  'node.loyalty.message': '🔔 lealtad',
  'scenario.main.0': 'Latte · efectivo',
  'scenario.main.1': 'Mocha · tarjeta',
  'scenario.main.2': 'Cancelar mocha',
  'scenario.main.3': 'Americano caliente con hielo',
  'scenario.main.4': 'Té · app',
}

export default texts
