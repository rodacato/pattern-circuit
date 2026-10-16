import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Pedido a la medida',
  'brief.problem': 'Pedido.new recibe nueve argumentos en orden. Un latte sale con la leche donde iba el jarabe, y un pedido imposible (caliente y con hielo) se cobra y explota en la cocina.',
  'brief.goal': 'Que cada pedido personalizado salga bien y que lo imposible se detecte antes de cobrar.',
  'node.order': 'Crear pedido',
  'socket.create-order': 'Crear pedido',
  'option.create-order.builder.title': 'Builder: paso a paso, y valida al final',
  'option.create-order.builder.body': 'Cada parte del pedido se fija con un método con nombre, así que no se puede cruzar la leche con el jarabe. Como build() recibe el pedido completo, puede revisarlo antes de crearlo y rechazar lo imposible en el mostrador, antes de cobrar.',
  'option.create-order.factory-method.title': 'Factory Method: un molde (una subclase) por combinación',
  'option.create-order.factory-method.body': 'Una fábrica crea productos de catálogo. Un pedido a la medida no está en el catálogo: harían falta cientos de moldes, uno por combinación, y los pedidos sin molde se pierden.',
  'option.create-order.decorator.title': 'Decorator: extras con nombre, pero sin revisión final',
  'option.create-order.decorator.body': 'Envolver el pedido con cada extra evita cruzar la leche con el jarabe. Pero nadie mira el pedido completo antes de cobrar: caliente y con hielo sigue explotando en la cocina.',
  'scenario.main.0': 'Latte grande',
  'scenario.main.1': 'Latte avena + vainilla',
  'scenario.main.2': 'Americano caliente con hielo',
  'node.bMilk': 'Leche',
  'node.bExtras': 'Extras',
  'node.build': 'build()',
  'node.notify.message': '✋ rechazado antes de cobrar',
  'node.presets': 'Moldes',
  'node.lattePreset': 'Latte grande',
  'node.americanoPreset': 'Americano',
  'node.withMilk': 'Con leche',
  'node.withSyrup': 'Con jarabe',
}

export default texts
