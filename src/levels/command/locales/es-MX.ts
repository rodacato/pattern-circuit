import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Me equivoqué de pedido',
  'brief.problem': 'Un cliente pide un latte y a los pocos segundos lo cancela. Pero el mostrador ejecuta cada pedido en el acto: cuando llega la cancelación, el latte ya se está preparando.',
  'brief.goal': 'Que un pedido cancelado a tiempo no se prepare, sin perder ningún otro pedido.',
  'node.undo': 'Deshacer',
  'node.barista': 'Barista',
  'socket.orders': 'Pedidos',
  'option.orders.command.title': 'Command: la petición convertida en objeto',
  'option.orders.command.body': 'Cada pedido se vuelve una tarjeta que se encola y se ejecuta cuando el barista se libera. Mientras espera, se puede cancelar: la cancelación saca la tarjeta de la cola antes de que corra. (Un Command también puede revertir lo ya ejecutado con un undo que guarde el estado previo.)',
  'option.orders.strategy.title': 'Strategy no puede volver en el tiempo',
  'option.orders.strategy.body': 'Cambiar cómo se cancela no sirve si la acción ya se ejecutó. Para cancelarla a tiempo, la petición tiene que existir como objeto antes de ejecutarse.',
  'option.orders.observer.title': 'Observer difunde, no deshace',
  'option.orders.observer.body': 'Avisar de la cancelación a todos hace que el barista la reciba… como si fuera un pedido más. Se prepara algo que nadie pidió.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Cancelar latte',
  'scenario.main.3': 'Té',
}

export default texts
