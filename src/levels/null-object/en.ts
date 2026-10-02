import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'El cliente sin tarjeta': 'The customer without a card',
  'Buscar la tarjeta de lealtad devuelve nil cuando el cliente no tiene una. Lealtad, Descuentos y el Recibo la usan sin preguntar, y el pedido explota con NoMethodError.': 'Looking up the loyalty card returns nil when the customer doesn\'t have one. Loyalty, Discount and the Receipt use it without checking, and the order blows up with NoMethodError.',
  'Que los clientes sin tarjeta pasen por todo el circuito sin llenar de "if card.nil?" cada lugar que la usa.': 'Let customers without a card go through the whole circuit without filling every place that uses it with "if card.nil?".',
  'Cliente': 'Customer',
  'Buscar tarjeta': 'Find card',
  'Lealtad': 'Loyalty',
  'Descuento': 'Discount',
  'Recibo': 'Receipt',
  'Entregar': 'Hand over',
  'Tarjeta': 'Card',
  'Null Object: un objeto que no hace nada': 'Null Object: an object that does nothing',
  'En lugar de nil, buscar devuelve una NullCard que responde a todo lo que responde una tarjeta, sin efecto: cero puntos, cero descuento. Los que la usan no cambian ni preguntan nada.': 'Instead of nil, the lookup returns a NullCard that answers everything a card answers, with no effect: zero points, zero discount. The code that uses it doesn\'t change or check anything.',
  'Envolver nil sigue siendo nil': 'Wrapping nil is still nil',
  'Un decorador delega en lo que envuelve. Si envuelve nil, la primera llamada explota igual.': 'A decorator delegates to what it wraps. If it wraps nil, the first call blows up all the same.',
  'Un proxy necesita un objeto real detrás': 'A proxy needs a real object behind it',
  'El sustituto intenta cargar la tarjeta real al usarla, pero no existe: el problema solo se posterga.': 'The stand-in tries to load the real card when used, but there isn\'t one: the problem is only postponed.',
  'No hay nada que adaptar': 'There\'s nothing to adapt',
  'Un adaptador traduce una interfaz existente. Sin tarjeta, no hay interfaz que traducir.': 'An adapter translates an existing interface. With no card, there\'s no interface to translate.',
  'pedidos que explotaron con NoMethodError': 'orders that blew up with NoMethodError',
  'Ana (con tarjeta)': 'Ana (with card)',
  'Beto (sin tarjeta)': 'Beto (no card)',
  'Carla (con tarjeta)': 'Carla (with card)',
  'Dani (sin tarjeta)': 'Dani (no card)',
}

export default en
