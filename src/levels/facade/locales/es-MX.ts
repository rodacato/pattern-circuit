import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'La cocina por dentro',
  'brief.problem': 'Para hacer un latte hay que usar molino, máquina y espumador en orden. El mostrador lo hace bien; la app de delivery copió los pasos y se saltó el espumador: sus lattes salen sin espuma.',
  'brief.goal': 'Que cualquier cliente pida un latte correcto sin conocer las máquinas, y que cambiar la cocina se haga en un solo lugar.',
  'node.app': 'App delivery',
  'node.grinder': 'Molino',
  'node.espresso': 'Máquina',
  'node.frother': 'Espumador',
  'node.grinderApp': 'Molino (app)',
  'node.espressoApp': 'Máquina (app)',
  'socket.kitchen': 'Cocina',
  'option.kitchen.facade.title': 'Facade: una puerta simple a un subsistema complicado',
  'option.kitchen.facade.body': 'Mostrador y app piden "un latte" a la fachada, y solo ella conoce el orden de las máquinas. La orquestación vive en un único lugar: nadie se salta un paso y un cambio en la cocina se hace una vez.',
  'option.kitchen.adapter.title': 'Adapter traduce la llamada, no la completa',
  'option.kitchen.adapter.body': 'Adaptar el pedido de la app al formato del mostrador no cambia que la app siga orquestando las máquinas por su cuenta, sin espumador.',
  'option.kitchen.proxy.title': 'Proxy controla el acceso, no la receta',
  'option.kitchen.proxy.body': 'Un intermediario frente a la máquina puede registrar o limitar su uso, pero no sabe que a la app le falta un paso de la receta.',
  'ticket.preheat': 'La máquina nueva necesita precalentarse antes de extraer.',
  'scenario.main.0': 'Latte',
  'scenario.main.1': 'Latte (app)',
  'scenario.main.2': 'Latte',
  'scenario.main.3': 'Latte (app)',
  'node.machineProxy': 'Proxy',
  'node.preheat': 'Precalentar',
  'node.preheatApp': 'Precalentar',
}

export default texts
