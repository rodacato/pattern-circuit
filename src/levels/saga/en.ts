import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Cobrado y sin avena': 'Charged and out of oat milk',
  'Tomar un pedido son tres pasos en servicios distintos: cobrar, reservar insumos y preparar. Si falta avena, el cobro ya se hizo: el cliente pagó y se queda sin nada.': 'Taking an order is three steps in different services: charge, reserve supplies and prepare. If oat milk runs out, the charge already went through: the customer paid and gets nothing.',
  'Que si un paso falla, los anteriores se compensen: el cliente recupera su dinero y se entera.': 'If a step fails, compensate the earlier ones: the customer gets their money back and finds out.',
  'Cliente': 'Customer',
  'Cobrar': 'Charge',
  'Reservar insumos': 'Reserve supplies',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Reembolsar': 'Refund',
  'Avisar al cliente': 'Notify customer',
  '💸 reembolsado y avisado': '💸 refunded and notified',
  'Pasos del pedido': 'Order steps',
  'Saga: cada paso con su compensación': 'Saga: each step with its compensation',
  'Sin una transacción que abarque los tres servicios, cada paso trae su acción compensatoria. Si reservar falla, se ejecutan las compensaciones de lo ya hecho en orden inverso: el cobro se corrige con un reembolso.': 'With no transaction spanning all three services, each step brings its compensating action. If reserving fails, the compensations for what\'s already done run in reverse order: the charge is corrected with a refund.',
  'Command deshace en memoria; una saga compensa entre servicios': 'Command undoes in memory; a saga compensates across services',
  'El undo de Command revierte estado local que el propio objeto guardó. Un cobro en el banco no se revierte: se compensa con una acción nueva (un reembolso), y alguien tiene que coordinar qué compensar cuando falla un paso en otro servicio. Command puede ser la pieza de cada paso, pero no orquesta la compensación.': 'Command\'s undo reverts local state the object itself saved. A charge at the bank can\'t be reverted: it\'s compensated with a new action (a refund), and someone has to coordinate what to compensate when a step fails in another service. Command can be the piece for each step, but it doesn\'t orchestrate the compensation.',
  'Avisar no es compensar': 'Notifying isn\'t compensating',
  'Todos se enteran de que el pedido falló, pero nadie devuelve el dinero.': 'Everyone finds out the order failed, but nobody gives the money back.',
  'clientes que pagaron y se quedaron sin nada': 'customers who paid and got nothing',
  'avisos sin reembolso': 'notifications without a refund',
  'Latte': 'Latte',
  'Mocha': 'Mocha',
  'Latte de avena': 'Oat milk latte',
  'Té': 'Tea',
}

export default en
