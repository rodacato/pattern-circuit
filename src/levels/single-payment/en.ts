import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Un solo método de pago': 'A single payment method',
  'La cafetería del aeropuerto solo acepta tarjeta, y así seguirá: el contrato con el banco es por años. Cobrar suma el IVA dos veces y alguien propone meter un Strategy de pagos "por si acaso".': 'The airport coffee shop only takes cards, and it\'ll stay that way: the contract with the bank runs for years. Charge adds VAT twice, and someone suggests adding a payments Strategy "just in case".',
  'Que cada cobro salga bien sin agregar piezas que hoy nadie necesita.': 'Make every charge come out right without adding pieces nobody needs today.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Cobrar': 'Charge',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Tarjeta': 'Card',
  'Fábrica de pagos': 'Payment factory',
  'Cobro': 'Charge',
  'Mantenerlo simple: arreglar el cálculo y nada más': 'Keep it simple: fix the calculation and nothing else',
  'Hay un solo método de pago y ninguno más a la vista: el arreglo es una línea en Cashier. Si mañana llega un segundo método, ese será el momento de refactorizar hacia Strategy, no antes.': 'There\'s a single payment method and no other in sight: the fix is one line in Cashier. If a second method shows up tomorrow, that\'ll be the time to refactor toward Strategy, not before.',
  'Strategy sin alternativas': 'Strategy with no alternatives',
  'Una interfaz, un registro y una sola implementación. Funciona, pero es complejidad que hay que cargar en cada cambio sin que nada la pida hoy: lo que Fowler llama el costo de cargar (YAGNI).': 'An interface, a registry and a single implementation. It works, but it\'s complexity you have to carry through every change with nothing asking for it today: what Fowler calls the cost of carry (YAGNI).',
  'Una fábrica para un solo producto': 'A factory for a single product',
  'Factory Method deja que una subclase decida qué crear; aquí siempre se crea lo mismo. GoF advierte que un patrón suma indirección y solo conviene cuando la flexibilidad que da hace falta.': 'Factory Method lets a subclass decide what to create; here the same thing is always created. GoF warns that a pattern adds indirection and only pays off when the flexibility it gives is needed.',
  'cobros con el IVA doble': 'charges with double VAT',
  'Latte': 'Latte',
  'Americano': 'Americano',
  'Té': 'Tea',
}

export default en
