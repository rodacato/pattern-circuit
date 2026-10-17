import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'El núcleo y el mundo',
  'brief.problem': 'Queremos correr pedidos de prueba en cada cambio. Pero el núcleo del negocio abre la base de datos real y cobra con Stripe directamente: en el entorno de pruebas no hay base de datos y todo explota.',
  'brief.goal': 'Que el mismo núcleo funcione en pruebas y en producción cambiando solo lo que se enchufa alrededor.',
  'node.web': 'App web',
  'node.core': 'Núcleo: pedidos',
  'node.postgres': 'Postgres',
  'node.stripe': 'Stripe',
  'node.confirm': 'Confirmar',
  'socket.dependencies': 'Dependencias',
  'option.dependencies.ports-and-adapters.title': 'Ports & Adapters: el núcleo define los enchufes',
  'option.dependencies.ports-and-adapters.body': 'El núcleo declara puertos (guardar pedidos, cobrar) y no sabe quién los implementa. En pruebas se enchufan adaptadores en memoria; en producción, Postgres y Stripe. Es la respuesta al Singleton del nivel 4: nada global: los adaptadores se enchufan desde afuera (por ejemplo, inyectados).',
  'option.dependencies.adapter.title': 'Un adaptador es una pieza, no la arquitectura',
  'option.dependencies.adapter.body': 'Adaptar Stripe es un buen paso, pero el núcleo sigue atado a Postgres. Ports & Adapters aplica la misma idea a todas las dependencias, y hace que sea el núcleo quien define las interfaces.',
  'option.dependencies.facade.title': 'Facade simplifica, pero aquí el núcleo sigue atado a Postgres',
  'option.dependencies.facade.body': 'La fachada reduce lo que el núcleo tiene que conocer, pero esta sigue conectándose a la base de datos real y a Stripe: el núcleo no se puede probar ni cambiar de base sin tocarla.',
  'option.dependencies.singleton.title': 'El precio del Singleton',
  'option.dependencies.singleton.body': 'Una conexión global única es justo lo que impide cambiarla por otra en las pruebas. Lo que en el nivel 4 resolvía, aquí estorba.',
  'scenario.main.0': 'Prueba 1',
  'scenario.main.1': 'Prueba 2',
  'scenario.main.2': 'Pedido real',
  'node.repoPort': 'Puerto: pedidos',
  'node.memRepo': 'En memoria',
  'node.pgRepo': 'Postgres',
  'node.payPort': 'Puerto: pagos',
  'node.fakePay': 'Pagos falsos',
  'node.stripePay': 'Stripe',
  'node.stripeAdapter': 'Adaptador',
  'node.infra': 'Infraestructura',
}

export default texts
