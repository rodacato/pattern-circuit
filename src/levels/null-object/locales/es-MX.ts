import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'El cliente sin tarjeta',
  'brief.problem': 'Buscar la tarjeta de lealtad devuelve nil cuando el cliente no tiene una. Lealtad, Descuentos y el Recibo la usan sin preguntar, y el pedido explota con NoMethodError.',
  'brief.goal': 'Que los clientes sin tarjeta pasen por todo el circuito sin llenar de "if card.nil?" cada lugar que la usa.',
  'node.lookup': 'Buscar tarjeta',
  'node.discount': 'Descuento',
  'node.receipt': 'Recibo',
  'socket.card': 'Tarjeta',
  'option.card.null-object.title': 'Null Object: un objeto que no hace nada',
  'option.card.null-object.body': 'En lugar de nil, buscar devuelve una NullCard que responde a todo lo que responde una tarjeta, sin efecto: cero puntos, cero descuento. Los que la usan no cambian ni preguntan nada.',
  'option.card.decorator.title': 'Envolver nil sigue siendo nil',
  'option.card.decorator.body': 'Un decorador delega en lo que envuelve. Si envuelve nil, la primera llamada explota igual.',
  'option.card.proxy.title': 'Un proxy necesita un objeto real detrás',
  'option.card.proxy.body': 'El sustituto intenta cargar la tarjeta real al usarla, pero no existe: el problema solo se posterga.',
  'option.card.adapter.title': 'No hay nada que adaptar',
  'option.card.adapter.body': 'Un adaptador traduce una interfaz existente. Sin tarjeta, no hay interfaz que traducir.',
  'win.1': 'pedidos que explotaron con NoMethodError',
  'scenario.main.0': 'Ana (con tarjeta)',
  'scenario.main.1': 'Beto (sin tarjeta)',
  'scenario.main.2': 'Carla (con tarjeta)',
  'scenario.main.3': 'Dani (sin tarjeta)',
}

export default texts
