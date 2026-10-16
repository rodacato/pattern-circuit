import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Un solo método de pago',
  'brief.problem': 'La cafetería del aeropuerto solo acepta tarjeta, y así seguirá: el contrato con el banco es por años. Cobrar suma el IVA dos veces y alguien propone meter un Strategy de pagos "por si acaso".',
  'brief.goal': 'Que cada cobro salga bien sin agregar piezas que hoy nadie necesita.',
  'socket.charging': 'Cobro',
  'option.charging.keep-simple.title': 'Mantenerlo simple: arreglar el cálculo y nada más',
  'option.charging.keep-simple.body': 'Hay un solo método de pago y ninguno más a la vista: el arreglo es una línea en Cashier. Si mañana llega un segundo método, ese será el momento de refactorizar hacia Strategy, no antes.',
  'option.charging.strategy.title': 'Strategy sin alternativas',
  'option.charging.strategy.body': 'Una interfaz, un registro y una sola implementación. Funciona, pero es complejidad que hay que cargar en cada cambio sin que nada la pida hoy: lo que Fowler llama el costo de cargar (YAGNI).',
  'option.charging.factory-method.title': 'Una fábrica para un solo producto',
  'option.charging.factory-method.body': 'Factory Method deja que una subclase decida qué crear; aquí siempre se crea lo mismo. GoF advierte que un patrón suma indirección y solo conviene cuando la flexibilidad que da hace falta.',
  'win.1': 'cobros con el IVA doble',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Americano',
  'scenario.main.2': 'Té',
  'node.card': 'Tarjeta',
  'node.factory': 'Fábrica de pagos',
}

export default texts
