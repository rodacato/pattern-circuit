import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Reembolsos': 'Refunds',
  'El cajero decide con ifs quién aprueba cada reembolso: él, el gerente o el dueño. Nadie previó los montos enormes y esos pedidos se pierden sin respuesta.':
    'The cashier uses ifs to decide who approves each refund: the cashier, the manager or the owner. Nobody planned for huge amounts, and those requests get lost with no answer.',
  'Que cada reembolso lo atienda quien pueda (o se rechace con aviso) y que sumar un aprobador no obligue a tocar al cajero.':
    'Have each refund handled by whoever can (or rejected with a notice), and make adding an approver not force you to touch the cashier.',
  'Cliente': 'Customer',
  'Cajero': 'Cashier',
  'Gerente': 'Manager',
  'Dueño': 'Owner',
  'Reembolsar': 'Refund',
  'Supervisor': 'Supervisor',
  'No procede': 'Declined',
  '💸 reembolsado': '💸 refunded',
  '✋ rechazado con aviso': '✋ rejected with notice',
  'Aprobación': 'Approval',
  'Chain of Responsibility: de mano en mano': 'Chain of Responsibility: from hand to hand',
  'Cada eslabón revisa la petición: si puede, la atiende; si no, la pasa al siguiente. El cajero ya no conoce a todos los aprobadores, y lo que nadie puede atender llega al final de la cadena y se rechaza con aviso.':
    'Each link checks the request: if it can, it handles it; if not, it passes it to the next one. The cashier no longer knows every approver, and whatever nobody can handle reaches the end of the chain and is rejected with a notice.',
  'Strategy funciona si conoces todas las categorías': 'Strategy works if you know every category',
  'Elegir el aprobador por categoría reparte bien los casos conocidos, pero exige saber de antemano quién decide cada uno. En la cadena, cada eslabón decide si lo toma, y siempre hay un final que responde.':
    'Picking the approver by category splits up the known cases nicely, but you must know in advance who decides each one. In the chain, each link decides whether to take it, and there\'s always an end that answers.',
  'Observer avisa a todos: todos aprueban': 'Observer notifies everyone: everyone approves',
  'Si el cajero difunde la petición a todos los aprobadores, cada uno la aprueba por su lado y el reembolso se paga varias veces.':
    'If the cashier broadcasts the request to every approver, each one approves it separately and the refund is paid several times.',
  'Nuevo rol: un supervisor aprueba los reembolsos medianos-altos.': 'New role: a supervisor approves medium-high refunds.',
  '$50': '$50',
  '$300': '$300',
  '$1500': '$1500',
  '$9000': '$9000',
  '$800': '$800',
}

export default en
