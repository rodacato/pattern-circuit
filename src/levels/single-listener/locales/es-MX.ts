import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Un solo interesado',
  'brief.problem': 'Cuando se cobra un pedido, la cocina tiene que enterarse para empezar a prepararlo. Hoy nadie le avisa y los pedidos se pierden. Solo la cocina necesita saberlo, y no hay otros interesados a la vista.',
  'brief.goal': 'Que la cocina reciba cada pedido y que el flujo se siga leyendo de corrido.',
  'socket.notice': 'Aviso a la cocina',
  'option.notice.keep-simple.title': 'Una llamada directa se lee de corrido',
  'option.notice.keep-simple.body': 'Con un solo interesado, Cashier llama a la cocina y el flujo queda escrito en el código de principio a fin. Un bus o una lista de suscriptores tendrán sentido cuando aparezcan más interesados.',
  'option.notice.event-bus.title': 'Un bus para un solo suscriptor',
  'option.notice.event-bus.body': 'Funciona, pero el flujo ya no está escrito en ningún lado: para saber qué pasa tras cobrar hay que buscar quién se suscribió. Fowler advierte que con eventos el flujo cuesta ver; aquí hay un solo oyente que no necesita correr después ni por separado, y la llamada directa basta.',
  'option.notice.command.title': 'Un comando que nadie encola ni deshace',
  'option.notice.command.body': 'Command convierte una petición en objeto para poder encolarla, deshacerla o registrarla. Aquí no se hace nada de eso: es un objeto más entre Cashier y la cocina.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Té',
  'node.bus': 'Bus de eventos',
  'node.startOrder': 'Orden a cocina',
}

export default texts
