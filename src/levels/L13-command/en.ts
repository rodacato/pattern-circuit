import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Me equivoqué de pedido': 'Wrong order',
  'Un cliente pide un latte y a los pocos segundos lo cancela. Pero el mostrador ejecuta cada pedido en el acto: cuando llega la cancelación, el latte ya se está preparando.':
    'A customer orders a latte and cancels it a few seconds later. But the counter runs every order on the spot: when the cancellation arrives, the latte is already being prepared.',
  'Que un pedido cancelado a tiempo no se prepare, sin perder ningún otro pedido.':
    'Make sure an order cancelled in time isn\'t prepared, without losing any other order.',
  'Cliente': 'Customer',
  'Mostrador': 'Counter',
  'Deshacer': 'Undo',
  'Barista': 'Barista',
  'Entregar': 'Hand over',
  'Cola': 'Queue',
  'Pedidos': 'Orders',
  'Command: la petición convertida en objeto': 'Command: the request turned into an object',
  'Cada pedido se vuelve una tarjeta que se encola y se ejecuta cuando el barista se libera. Mientras espera, se puede cancelar: la cancelación saca la tarjeta de la cola antes de que corra. (Un Command también puede revertir lo ya ejecutado con un undo que guarde el estado previo.)':
    'Each order becomes a card that is queued and runs when the barista is free. While it waits, it can be cancelled: the cancellation takes the card out of the queue before it runs. (A Command can also revert what already ran with an undo that stores the previous state.)',
  'Strategy no puede volver en el tiempo': 'Strategy can\'t go back in time',
  'Cambiar cómo se cancela no sirve si la acción ya se ejecutó. Para cancelarla a tiempo, la petición tiene que existir como objeto antes de ejecutarse.':
    'Changing how you cancel doesn\'t help if the action already ran. To cancel it in time, the request has to exist as an object before it runs.',
  'Observer difunde, no deshace': 'Observer broadcasts, it doesn\'t undo',
  'Avisar de la cancelación a todos hace que el barista la reciba… como si fuera un pedido más. Se prepara algo que nadie pidió.':
    'Notifying everyone about the cancellation means the barista gets it… as if it were just another order. Something nobody ordered gets prepared.',
  'Latte': 'Latte',
  'Mocha': 'Mocha',
  'Cancelar latte': 'Cancel latte',
  'Té': 'Tea',
}

export default en
