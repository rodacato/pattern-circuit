import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Servicios que se enteran': 'Services that find out',
  'Pedidos y Devoluciones avisan a mano a Inventario, Facturación y Lealtad. Cada productor lleva su propia lista, y Devoluciones olvidó a Facturación y a Lealtad: las devoluciones nunca se facturan.': 'Orders and Returns manually notify Inventory, Billing and Loyalty. Each producer keeps its own list, and Returns forgot Billing and Loyalty: returns never get billed.',
  'Que cada evento llegue a todos los servicios interesados, venga de quien venga, y que sumar un servicio no toque a los productores.': 'Make every event reach all interested services, no matter who sends it, and make adding a service not touch the producers.',
  'Pedidos': 'Orders',
  'Devoluciones': 'Returns',
  'Servicio de pedidos': 'Orders service',
  'Servicio de devoluciones': 'Returns service',
  'Inventario': 'Inventory',
  'Facturación': 'Billing',
  'Lealtad': 'Loyalty',
  'Analytics': 'Analytics',
  'Bus de eventos': 'Event bus',
  '📨 Inventario': '📨 Inventory',
  '📨 Facturación': '📨 Billing',
  '📨 Lealtad': '📨 Loyalty',
  '📨 Analytics': '📨 Analytics',
  'Eventos': 'Events',
  'Event Bus: nadie se cablea con nadie': 'Event Bus: nobody is wired to anybody',
  'Los productores publican en el bus y los consumidores se suscriben al bus. Ninguno conoce a los demás: un evento llega a todos los interesados venga de donde venga.': 'Producers publish to the bus and consumers subscribe to the bus. None of them knows the others: an event reaches everyone interested, wherever it comes from.',
  'Observer, un sujeto a la vez': 'Observer, one subject at a time',
  'Cada productor como sujeto con suscriptores ya no llama a mano, pero cada uno sigue llevando su propia lista, y la de Devoluciones sigue incompleta. El bus centraliza las suscripciones para todos los productores.': 'With each producer as a subject with subscribers, nobody calls by hand anymore, but each one still keeps its own list, and the Returns list is still incomplete. The bus centralizes subscriptions for all producers.',
  'Facade agrupa, no distribuye': 'Facade groups, it doesn\'t distribute',
  'Una fachada de servicios simplifica la llamada, pero cada productor sigue decidiendo a quién avisar.': 'A services facade simplifies the call, but each producer still decides whom to notify.',
  'Nuevo servicio: Analytics quiere enterarse de todo.': 'New service: Analytics wants to hear about everything.',
  'Pedido': 'Order',
  'Devolución': 'Return',
}

export default en
