import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  '¡Pedido listo!': 'Order ready!',
  'Cuando un pedido está listo hay que avisar a la pantalla, a la app del cliente y al programa de lealtad. El pedido llama a cada uno por nombre… y a Lealtad nunca la llama.':
    'When an order is ready, the display, the customer app and the loyalty program must be notified. The order calls each one by name… and never calls Loyalty.',
  'Que todos los interesados se enteren y que sumar uno nuevo no obligue a tocar el pedido.':
    'Make sure everyone interested finds out, and that adding a new one doesn\'t force you to touch the order.',
  'Cliente': 'Customer',
  'Preparar': 'Prepare',
  'Pedido listo': 'Order ready',
  'Pantalla': 'Display',
  'App del cliente': 'Customer app',
  'Lealtad': 'Loyalty',
  'Cocina': 'Kitchen',
  '🔔 Pantalla avisada': '🔔 Display notified',
  '🔔 App del cliente avisada': '🔔 Customer app notified',
  '🔔 Lealtad avisada': '🔔 Loyalty notified',
  '🔔 Cocina avisada': '🔔 Kitchen notified',
  'Avisos': 'Notifications',
  'Observer: avisar a todos los suscriptores': 'Observer: notify every subscriber',
  'El pedido emite un aviso y cada interesado se suscribe por su cuenta. El pedido ya no conoce a nadie por nombre: sumar un suscriptor es registrarlo, sin tocar al pedido.':
    'The order emits a notification and each interested party subscribes on its own. The order no longer knows anyone by name: adding a subscriber means registering it, without touching the order.',
  'Strategy elige uno; Observer avisa a todos': 'Strategy picks one; Observer notifies all',
  'Con una estrategia de aviso el pedido elige un canal: solo la pantalla se entera. Aquí no había que elegir, había que difundir.':
    'With a notification strategy the order picks one channel: only the display finds out. There was nothing to pick here; it had to broadcast.',
  'En una cadena, alguien se queda con el mensaje': 'In a chain, someone keeps the message',
  'Chain of Responsibility pasa la petición hasta que un eslabón la atiende, y ahí termina. La pantalla atendió el aviso y los demás nunca lo vieron.':
    'Chain of Responsibility passes the request along until a link handles it, and there it ends. The display handled the notification and the others never saw it.',
  'La cocina también quiere enterarse, para reponer insumos.': 'The kitchen wants to know too, to restock supplies.',
  'Latte': 'Latte',
  'Mocha': 'Mocha',
  'Té': 'Tea',
}

export default en
