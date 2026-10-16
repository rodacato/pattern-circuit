import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'La terminal nueva',
  'brief.problem': 'Contratamos la terminal PagoFácil. Su SDK habla otro idioma: Cobrar envía pagos en su formato (■) y la terminal solo acepta el suyo (◆). Todo rebota.',
  'brief.goal': 'Que Cobrar use la terminal nueva sin tocar Cobrar ni el SDK del proveedor.',
  'node.terminal': 'PagoFácil',
  'socket.gateway': 'Pasarela de pago',
  'option.gateway.adapter.title': 'Adapter: un traductor entre dos interfaces',
  'option.gateway.adapter.body': 'Cobrar sigue llamando charge(total) y el SDK sigue sin cambios. El adaptador traduce una llamada a la otra: el pulso entra cuadrado y sale con la forma que la terminal entiende.',
  'option.gateway.decorator.title': 'Decorator añade, pero conserva la interfaz',
  'option.gateway.decorator.body': 'El envoltorio registra cada cobro y delega exactamente la misma llamada. La forma del pulso no cambia: la terminal lo sigue rechazando.',
  'option.gateway.facade.title': 'Facade simplifica un subsistema; Adapter encaja una interfaz',
  'option.gateway.facade.body': 'Facade define una interfaz nueva y más simple sobre un subsistema de varias piezas. Aquí no hay subsistema: hay una sola clase cuya interfaz no coincide con la que Cobrar ya espera. Esta fachada reenvía charge tal cual y la terminal lo rechaza; si tradujera a la interfaz existente, sería un Adapter.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Té',
  'node.logger': 'Con log',
  'node.payments': 'Pagos',
}

export default texts
