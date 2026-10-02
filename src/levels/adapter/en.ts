import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'La terminal nueva': 'The new terminal',
  'Contratamos la terminal PagoFácil. Su SDK habla otro idioma: Cobrar envía pagos en su formato (■) y la terminal solo acepta el suyo (◆). Todo rebota.': 'We signed up for the PagoFácil terminal. Its SDK speaks another language: Charge sends payments in its own format (■) and the terminal only accepts its own (◆). Everything bounces.',
  'Que Cobrar use la terminal nueva sin tocar Cobrar ni el SDK del proveedor.': 'Make Charge use the new terminal without touching Charge or the vendor\'s SDK.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Cobrar': 'Charge',
  'PagoFácil': 'PagoFácil',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Adaptador': 'Adapter',
  'Con log': 'With log',
  'Pagos': 'Payments',
  'Pasarela de pago': 'Payment gateway',
  'Adapter: un traductor entre dos interfaces': 'Adapter: a translator between two interfaces',
  'Cobrar sigue llamando charge(total) y el SDK sigue sin cambios. El adaptador traduce una llamada a la otra: el pulso entra cuadrado y sale con la forma que la terminal entiende.': 'Charge keeps calling charge(total) and the SDK stays unchanged. The adapter translates one call into the other: the pulse goes in square and comes out in the shape the terminal understands.',
  'Decorator añade, pero conserva la interfaz': 'Decorator adds, but keeps the interface',
  'El envoltorio registra cada cobro y delega exactamente la misma llamada. La forma del pulso no cambia: la terminal lo sigue rechazando.': 'The wrapper logs each charge and delegates the exact same call. The pulse\'s shape doesn\'t change: the terminal still rejects it.',
  'Facade simplifica un subsistema; Adapter encaja una interfaz': 'Facade simplifies a subsystem; Adapter fits an interface',
  'Facade define una interfaz nueva y más simple sobre un subsistema de varias piezas. Aquí no hay subsistema: hay una sola clase cuya interfaz no coincide con la que Cobrar ya espera. Esta fachada reenvía charge tal cual y la terminal lo rechaza; si tradujera a la interfaz existente, sería un Adapter.': 'Facade defines a new, simpler interface over a subsystem with several pieces. There\'s no subsystem here: there\'s a single class whose interface doesn\'t match the one Charge already expects. This facade forwards charge as is and the terminal rejects it; if it translated to the existing interface, it would be an Adapter.',
  'Latte': 'Latte',
  'Mocha': 'Mocha',
  'Té': 'Tea',
}

export default en
