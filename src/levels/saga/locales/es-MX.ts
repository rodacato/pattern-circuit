import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Cobrado y sin avena',
  'brief.problem': 'Tomar un pedido son tres pasos en servicios distintos: cobrar, reservar insumos y preparar. Si falta avena, el cobro ya se hizo: el cliente pagó y se queda sin nada.',
  'brief.goal': 'Que si un paso falla, los anteriores se compensen: el cliente recupera su dinero y se entera.',
  'node.reserve': 'Reservar insumos',
  'socket.steps': 'Pasos del pedido',
  'option.steps.saga.title': 'Saga: cada paso con su compensación',
  'option.steps.saga.body': 'Sin una transacción que abarque los tres servicios, cada paso trae su acción compensatoria. Si reservar falla, se ejecutan las compensaciones de lo ya hecho en orden inverso: el cobro se corrige con un reembolso.',
  'option.steps.command.title': 'Command encapsula cada paso; una saga coordina la compensación',
  'option.steps.command.body': 'El undo de un Command suele revertir lo que ese mismo objeto guardó. Un cobro en el banco no se revierte: se compensa con una acción nueva (un reembolso), y alguien tiene que coordinar qué compensar cuando falla un paso en otro servicio. Command puede ser la pieza de cada paso, pero no orquesta la compensación.',
  'option.steps.observer.title': 'Avisar no es compensar',
  'option.steps.observer.body': 'Todos se enteran de que el pedido falló, pero nadie devuelve el dinero.',
  'win.1': 'clientes que pagaron y se quedaron sin nada',
  'win.2': 'avisos sin reembolso',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Latte de avena',
  'scenario.main.3': 'Té',
  'node.refund': 'Reembolsar',
  'node.notify.message': '💸 reembolsado y avisado',
}

export default texts
