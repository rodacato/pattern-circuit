import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: '¿Efectivo o tarjeta?',
  'brief.problem': 'Cobrar decide el método de pago con una cadena de if. Los vales caen en el else y el pedido desaparece.',
  'brief.goal': 'Que todos los métodos de pago funcionen y que agregar uno nuevo no obligue a abrir Cobrar.',
  'socket.payment-method': 'Método de pago',
  'option.payment-method.strategy.title': 'Strategy: elegir entre alternativas intercambiables',
  'option.payment-method.strategy.body': 'Cada forma de cobrar vive en su propio cartucho con la misma interfaz. Cobrar solo delega; agregar un método es agregar un cartucho.',
  'option.payment-method.observer.title': 'Observer avisa a todos',
  'option.payment-method.observer.body': 'Observer difunde un evento a cada suscriptor. Aquí cada método de pago cobró el mismo pedido: el problema pedía elegir uno, no avisar a todos.',
  'option.payment-method.decorator.title': 'Decorator añade, no elige',
  'option.payment-method.decorator.body': 'Decorator envuelve un objeto para sumarle comportamiento. El pedido llegó envuelto… al mismo árbol de if, y el vale se perdió igual.',
  'ticket.app-payment': 'Ahora también aceptamos pago con app.',
  'scenario.main.0': 'Efectivo',
  'scenario.main.1': 'Tarjeta',
  'scenario.main.2': 'Vale',
  'scenario.with-app.0': 'Efectivo',
  'scenario.with-app.1': 'Tarjeta',
  'scenario.with-app.2': 'Vale',
  'scenario.with-app.3': 'App',
  'node.cashPayment': 'Efectivo',
  'node.cardPayment': 'Tarjeta',
  'node.voucherPayment': 'Vale',
  'node.wrapper': 'Envoltura',
  'node.appPayment': 'App',
}

export default texts
