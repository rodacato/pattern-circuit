import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  '¿Efectivo o tarjeta?': 'Cash or card?',
  'Cobrar decide el método de pago con una cadena de if. Los vales caen en el else y el pedido desaparece.': 'Charge picks the payment method with a chain of ifs. Vouchers fall into the else and the order disappears.',
  'Que todos los métodos de pago funcionen y que agregar uno nuevo no obligue a abrir Cobrar.': 'Make every payment method work, and make adding a new one not require opening Charge.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Cobrar': 'Charge',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Efectivo': 'Cash',
  'Tarjeta': 'Card',
  'Vale': 'Voucher',
  'App': 'App',
  'Envoltura': 'Wrapper',
  'Método de pago': 'Payment method',
  'Strategy: elegir entre alternativas intercambiables': 'Strategy: choose among interchangeable alternatives',
  'Cada forma de cobrar vive en su propio cartucho con la misma interfaz. Cobrar solo delega; agregar un método es agregar un cartucho.': 'Each way of charging lives in its own cartridge with the same interface. Charge just delegates; adding a method means adding a cartridge.',
  'Observer avisa a todos': 'Observer notifies everyone',
  'Observer difunde un evento a cada suscriptor. Aquí cada método de pago cobró el mismo pedido: el problema pedía elegir uno, no avisar a todos.': 'Observer broadcasts an event to every subscriber. Here every payment method charged the same order: the problem called for choosing one, not notifying them all.',
  'Decorator añade, no elige': 'Decorator adds, it doesn\'t choose',
  'Decorator envuelve un objeto para sumarle comportamiento. El pedido llegó envuelto… al mismo árbol de if, y el vale se perdió igual.': 'Decorator wraps an object to add behavior to it. The order arrived wrapped… at the same tree of ifs, and the voucher got lost all the same.',
  'Ahora también aceptamos pago con app.': 'Now we also accept payment by app.',
}

export default en
