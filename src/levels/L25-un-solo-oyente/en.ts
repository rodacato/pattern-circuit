import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Un solo interesado': 'A single interested party',
  'Cuando se cobra un pedido, la cocina tiene que enterarse para empezar a prepararlo. Hoy nadie le avisa y los pedidos se pierden. Solo la cocina necesita saberlo, y no hay otros interesados a la vista.': 'When an order is charged, the kitchen has to find out so it can start preparing it. Today nobody tells it and orders get lost. Only the kitchen needs to know, and there are no other interested parties in sight.',
  'Que la cocina reciba cada pedido y que el flujo se siga leyendo de corrido.': 'Make sure the kitchen gets every order and the flow still reads straight through.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Cobrar': 'Charge',
  'Cocina': 'Kitchen',
  'Entregar': 'Hand over',
  'Bus de eventos': 'Event bus',
  'Orden a cocina': 'Kitchen order',
  'Aviso a la cocina': 'Kitchen notice',
  'Una llamada directa se lee de corrido': 'A direct call reads straight through',
  'Con un solo interesado, Cashier llama a la cocina y el flujo queda escrito en el código de principio a fin. Un bus o una lista de suscriptores tendrán sentido cuando aparezcan más interesados.': 'With a single interested party, Cashier calls the kitchen and the flow is written in the code from start to finish. A bus or a list of subscribers will make sense when more interested parties show up.',
  'Un bus para un solo suscriptor': 'A bus for a single subscriber',
  'Funciona, pero el flujo ya no está escrito en ningún lado: para saber qué pasa tras cobrar hay que buscar quién se suscribió. Fowler advierte que con eventos el flujo cuesta ver; con un solo oyente, no hay nada que desacoplar.': 'It works, but the flow is no longer written anywhere: to know what happens after charging you have to hunt down who subscribed. Fowler warns that with events the flow is hard to see; with a single listener, there\'s nothing to decouple.',
  'Un comando que nadie encola ni deshace': 'A command nobody queues or undoes',
  'Command convierte una petición en objeto para poder encolarla, deshacerla o registrarla. Aquí no se hace nada de eso: es un objeto más entre Cashier y la cocina.': 'Command turns a request into an object so it can be queued, undone or logged. None of that happens here: it\'s just one more object between Cashier and the kitchen.',
  'Latte': 'Latte',
  'Mocha': 'Mocha',
  'Té': 'Tea',
}

export default en
