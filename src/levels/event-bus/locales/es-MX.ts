import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Servicios que se enteran',
  'brief.problem': 'Pedidos y Devoluciones avisan a mano a Inventario, Facturación y Lealtad. Cada productor lleva su propia lista, y Devoluciones olvidó a Facturación y a Lealtad: las devoluciones nunca se facturan.',
  'brief.goal': 'Que cada evento llegue a todos los servicios interesados, venga de quien venga, y que sumar un servicio no toque a los productores.',
  'node.customers': 'Pedidos',
  'node.refundEvents': 'Devoluciones',
  'node.orders': 'Servicio de pedidos',
  'node.returns': 'Servicio de devoluciones',
  'node.inventory': 'Inventario',
  'node.inventory.message': '📨 Inventario',
  'node.billing': 'Facturación',
  'node.billing.message': '📨 Facturación',
  'node.loyalty.message': '📨 Lealtad',
  'socket.events': 'Eventos',
  'option.events.event-bus.title': 'Event Bus: nadie se cablea con nadie',
  'option.events.event-bus.body': 'Los productores publican en el bus y los consumidores se suscriben al bus. Ninguno conoce a los demás: un evento llega a todos los interesados venga de donde venga.',
  'option.events.observer.title': 'Observer, un sujeto a la vez',
  'option.events.observer.body': 'Cada productor como sujeto con suscriptores ya no llama a mano, pero cada uno sigue llevando su propia lista, y la de Devoluciones sigue incompleta. El bus centraliza las suscripciones para todos los productores.',
  'option.events.facade.title': 'Facade agrupa, no distribuye',
  'option.events.facade.body': 'Una fachada de servicios simplifica la llamada, pero cada productor sigue decidiendo a quién avisar.',
  'ticket.analytics': 'Nuevo servicio: Analytics quiere enterarse de todo.',
  'scenario.main.0': 'Pedido',
  'scenario.main.1': 'Devolución',
  'scenario.main.2': 'Pedido',
  'node.bus': 'Bus de eventos',
  'node.analytics': 'Analytics',
  'node.analytics.message': '📨 Analytics',
}

export default texts
