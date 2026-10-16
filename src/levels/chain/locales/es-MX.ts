import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Reembolsos',
  'brief.problem': 'El cajero decide con ifs quién aprueba cada reembolso: él, el gerente o el dueño. Nadie previó los montos enormes y esos pedidos se pierden sin respuesta.',
  'brief.goal': 'Que cada reembolso lo atienda quien pueda (o se rechace con aviso) y que sumar un aprobador no obligue a tocar al cajero.',
  'node.cashier': 'Cajero',
  'node.manager': 'Gerente',
  'node.owner': 'Dueño',
  'node.refund': 'Reembolsar',
  'node.refund.message': '💸 reembolsado',
  'socket.approval': 'Aprobación',
  'option.approval.chain-of-responsibility.title': 'Chain of Responsibility: de mano en mano',
  'option.approval.chain-of-responsibility.body': 'Cada eslabón revisa la petición: si puede, la atiende; si no, la pasa al siguiente. El cajero ya no conoce a todos los aprobadores, y lo que nadie puede atender llega al final de la cadena y se rechaza con aviso.',
  'option.approval.strategy.title': 'Strategy funciona si conoces todas las categorías',
  'option.approval.strategy.body': 'Elegir el aprobador por categoría reparte bien los casos conocidos, pero exige saber de antemano quién decide cada uno. En la cadena, cada eslabón decide si lo toma, y siempre hay un final que responde.',
  'option.approval.observer.title': 'Observer avisa a todos: todos aprueban',
  'option.approval.observer.body': 'Si el cajero difunde la petición a todos los aprobadores, cada uno la aprueba por su lado y el reembolso se paga varias veces.',
  'ticket.supervisor': 'Nuevo rol: un supervisor aprueba los reembolsos medianos-altos.',
  'scenario.main.0': '$50',
  'scenario.main.1': '$300',
  'scenario.main.2': '$1500',
  'scenario.main.3': '$9000',
  'scenario.with-supervisor.0': '$50',
  'scenario.with-supervisor.1': '$300',
  'scenario.with-supervisor.2': '$1500',
  'scenario.with-supervisor.3': '$9000',
  'scenario.with-supervisor.4': '$800',
  'node.declined': 'No procede',
  'node.declined.message': '✋ rechazado con aviso',
  'node.supervisor': 'Supervisor',
}

export default texts
