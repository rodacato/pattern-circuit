import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Pedido a la medida': 'Custom order',
  'Pedido.new recibe nueve argumentos en orden. Un latte sale con la leche donde iba el jarabe, y un pedido imposible (caliente y con hielo) se cobra y explota en la cocina.': 'Pedido.new takes nine arguments in order. A latte comes out with the milk where the syrup should go, and an impossible order (hot and with ice) gets charged and blows up in the kitchen.',
  'Que cada pedido personalizado salga bien y que lo imposible se detecte antes de cobrar.': 'Make every custom order come out right, and catch the impossible ones before charging.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Crear pedido': 'Create order',
  'Cobrar': 'Charge',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Tamaño': 'Size',
  'Leche': 'Milk',
  'Extras': 'Extras',
  'build()': 'build()',
  'Avisar al cliente': 'Notify customer',
  'Moldes': 'Molds',
  'Latte grande': 'Large latte',
  'Americano': 'Americano',
  'Con leche': 'With milk',
  'Con jarabe': 'With syrup',
  '✋ rechazado antes de cobrar': '✋ rejected before charging',
  'Builder: paso a paso, y valida al final': 'Builder: step by step, validating at the end',
  'Cada parte del pedido se fija con un método con nombre, así que no se puede cruzar la leche con el jarabe. Como build() recibe el pedido completo, puede revisarlo antes de crearlo y rechazar lo imposible en el mostrador, antes de cobrar.': 'Each part of the order is set with a named method, so the milk can\'t get mixed up with the syrup. Since build() gets the complete order, it can check it before creating it and reject the impossible at the counter, before charging.',
  'Factory Method: un molde (una subclase) por combinación': 'Factory Method: one mold (one subclass) per combination',
  'Una fábrica crea productos de catálogo. Un pedido a la medida no está en el catálogo: harían falta cientos de moldes, uno por combinación, y los pedidos sin molde se pierden.': 'A factory creates catalog products. A custom order isn\'t in the catalog: you\'d need hundreds of molds, one per combination, and orders without a mold get lost.',
  'Decorator: extras con nombre, pero sin revisión final': 'Decorator: named extras, but no final check',
  'Envolver el pedido con cada extra evita cruzar la leche con el jarabe. Pero nadie mira el pedido completo antes de cobrar: caliente y con hielo sigue explotando en la cocina.': 'Wrapping the order with each extra keeps the milk and syrup from getting mixed up. But nobody looks at the complete order before charging: hot with ice still blows up in the kitchen.',
  'Latte avena + vainilla': 'Oat latte + vanilla',
  'Americano caliente con hielo': 'Hot Americano with ice',
}

export default en
