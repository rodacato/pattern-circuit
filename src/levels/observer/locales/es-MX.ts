import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: '¡Pedido listo!',
  'brief.problem': 'Cuando un pedido está listo hay que avisar a la pantalla, a la app del cliente y al programa de lealtad. El pedido llama a cada uno por nombre… y a Lealtad nunca la llama.',
  'brief.goal': 'Que todos los interesados se enteren y que sumar uno nuevo no obligue a tocar el pedido.',
  'node.bar': 'Preparar',
  'node.ready': 'Pedido listo',
  'node.display.message': '🔔 Pantalla avisada',
  'node.push': 'App del cliente',
  'node.push.message': '🔔 App del cliente avisada',
  'node.loyalty.message': '🔔 Lealtad avisada',
  'socket.notices': 'Avisos',
  'option.notices.observer.title': 'Observer: avisar a todos los suscriptores',
  'option.notices.observer.body': 'El pedido emite un aviso y cada interesado se suscribe por su cuenta. El pedido ya no conoce a nadie por nombre: sumar un suscriptor es registrarlo, sin tocar al pedido.',
  'option.notices.strategy.title': 'Strategy elige uno; Observer avisa a todos',
  'option.notices.strategy.body': 'Con una estrategia de aviso el pedido elige un canal: solo la pantalla se entera. Aquí no había que elegir, había que difundir.',
  'option.notices.chain-of-responsibility.title': 'En una cadena, alguien se queda con el mensaje',
  'option.notices.chain-of-responsibility.body': 'Chain of Responsibility pasa la petición hasta que un eslabón la atiende, y ahí termina. La pantalla atendió el aviso y los demás nunca lo vieron.',
  'ticket.kitchen': 'La cocina también quiere enterarse, para reponer insumos.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Mocha',
  'scenario.main.2': 'Té',
  'node.kitchen.message': '🔔 Cocina avisada',
}

export default texts
