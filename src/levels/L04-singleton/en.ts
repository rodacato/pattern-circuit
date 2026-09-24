import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Turnos repetidos': 'Repeated ticket numbers',
  'Abrimos una segunda caja. Cada caja crea su propio contador de turnos y la pantalla anuncia el turno 1 dos veces, el 2 dos veces…': 'We opened a second register. Each register creates its own ticket counter, and the display announces number 1 twice, number 2 twice…',
  'Que todos los turnos sean únicos sin importar qué caja cobre.': 'Make every ticket number unique, no matter which register charges.',
  'Cliente': 'Customer',
  'Fila': 'Line',
  'Caja A': 'Register A',
  'Caja B': 'Register B',
  'Contador': 'Counter',
  'Pantalla': 'Display',
  'Contador de turnos': 'Ticket counter',
  'Singleton: una sola instancia compartida': 'Singleton: a single shared instance',
  'Todas las cajas usan el mismo contador y los turnos ya no se repiten. Ojo con el precio: ahora cualquier clase puede alcanzar ese contador global. Ese acoplamiento vuelve en el nivel de Ports & Adapters.': 'All registers use the same counter and ticket numbers no longer repeat. Mind the cost: now any class can reach that global counter. That coupling comes back in the Ports & Adapters level.',
  'Factory Method crea objetos nuevos': 'Factory Method creates new objects',
  'Una fábrica entrega un contador recién hecho en cada pedido: todos los turnos salen con el número 1. Aquí no hacía falta crear más, sino compartir uno.': 'A factory hands out a freshly made counter for each order: every ticket comes out as number 1. Here you didn\'t need to create more, but to share one.',
  'Strategy intercambia comportamiento, no comparte estado': 'Strategy swaps behavior, it doesn\'t share state',
  'Cada caja recibe su estrategia de numeración, pero cada una crea su propia cuenta. El problema era de identidad (una sola cuenta), no de algoritmo. Inyectar el mismo contador a ambas cajas también funcionaría, sin nada global: lo verás en Ports & Adapters.': 'Each register gets its numbering strategy, but each one creates its own count. The problem was about identity (a single count), not the algorithm. Injecting the same counter into both registers would also work, with nothing global: you\'ll see it in Ports & Adapters.',
}

export default en
