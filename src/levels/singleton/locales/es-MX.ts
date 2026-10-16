import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Turnos repetidos',
  'brief.problem': 'Abrimos una segunda caja. Cada caja crea su propio contador de turnos y la pantalla anuncia el turno 1 dos veces, el 2 dos veces…',
  'brief.goal': 'Que todos los turnos sean únicos sin importar qué caja cobre.',
  'node.lobby': 'Fila',
  'node.registerA': 'Caja A',
  'node.registerB': 'Caja B',
  'node.counterA': 'Contador',
  'node.counterB': 'Contador',
  'socket.ticketCounter': 'Contador de turnos',
  'option.ticketCounter.singleton.title': 'Singleton: una sola instancia compartida',
  'option.ticketCounter.singleton.body': 'Todas las cajas usan el mismo contador y los turnos ya no se repiten. Ojo con el precio: ahora cualquier clase puede alcanzar ese contador global. Ese acoplamiento vuelve en el nivel de Ports & Adapters.',
  'option.ticketCounter.factory-method.title': 'Factory Method crea objetos nuevos',
  'option.ticketCounter.factory-method.body': 'Una fábrica entrega un contador recién hecho en cada pedido: todos los turnos salen con el número 1. Aquí no hacía falta crear más, sino compartir uno.',
  'option.ticketCounter.strategy.title': 'Strategy intercambia comportamiento, no comparte estado',
  'option.ticketCounter.strategy.body': 'Cada caja recibe su estrategia de numeración, pero cada una crea su propia cuenta. El problema era de identidad (una sola cuenta), no de algoritmo. Inyectar el mismo contador a ambas cajas también funcionaría, sin nada global: lo verás en Ports & Adapters.',
  'scenario.main.0': 'Caja A',
  'scenario.main.1': 'Caja B',
  'scenario.main.2': 'Caja A',
  'scenario.main.3': 'Caja B',
  'scenario.main.4': 'Caja A',
  'scenario.main.5': 'Caja B',
  'node.ticketCounter': 'Contador',
  'node.factoryA': 'Contador',
  'node.factoryB': 'Contador',
}

export default texts
