import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'El núcleo y el mundo': 'The core and the world',
  'Queremos correr pedidos de prueba en cada cambio. Pero el núcleo del negocio abre la base de datos real y cobra con Stripe directamente: en el entorno de pruebas no hay base de datos y todo explota.': 'We want to run test orders on every change. But the business core opens the real database and charges with Stripe directly: the test environment has no database and everything blows up.',
  'Que el mismo núcleo funcione en pruebas y en producción cambiando solo lo que se enchufa alrededor.': 'Make the same core work in tests and in production by changing only what gets plugged in around it.',
  'App web': 'Web app',
  'Núcleo: pedidos': 'Core: orders',
  'Postgres': 'Postgres',
  'Stripe': 'Stripe',
  'Confirmar': 'Confirm',
  'Puerto: pedidos': 'Port: orders',
  'En memoria': 'In memory',
  'Puerto: pagos': 'Port: payments',
  'Pagos falsos': 'Fake payments',
  'Adaptador': 'Adapter',
  'Infraestructura': 'Infrastructure',
  'Dependencias': 'Dependencies',
  'Ports & Adapters: el núcleo define los enchufes': 'Ports & Adapters: the core defines the plugs',
  'El núcleo declara puertos (guardar pedidos, cobrar) y no sabe quién los implementa. En pruebas se enchufan adaptadores en memoria; en producción, Postgres y Stripe. Es la respuesta al Singleton del nivel 4: nada global: los adaptadores se enchufan desde afuera (por ejemplo, inyectados).': 'The core declares ports (save orders, charge) and doesn\'t know who implements them. In tests you plug in in-memory adapters; in production, Postgres and Stripe. It is the answer to the Singleton from level 4: nothing global: adapters are plugged in from outside (for example, injected).',
  'Un adaptador es una pieza, no la arquitectura': 'An adapter is a piece, not the architecture',
  'Adaptar Stripe es un buen paso, pero el núcleo sigue atado a Postgres. Ports & Adapters aplica la misma idea a todas las dependencias, y hace que sea el núcleo quien define las interfaces.': 'Adapting Stripe is a good step, but the core is still tied to Postgres. Ports & Adapters applies the same idea to every dependency, and makes the core the one that defines the interfaces.',
  'Facade esconde, no desacopla': 'Facade hides, it doesn\'t decouple',
  'Agrupar la infraestructura detrás de una fachada no cambia que el núcleo termine llamando a la base de datos real.': 'Grouping the infrastructure behind a facade doesn\'t change the fact that the core ends up calling the real database.',
  'El precio del Singleton': 'The price of Singleton',
  'Una conexión global única es justo lo que impide cambiarla por otra en las pruebas. Lo que en el nivel 4 resolvía, aquí estorba.': 'A single global connection is exactly what prevents swapping it for another one in tests. What solved things in level 4 gets in the way here.',
  'Prueba 1': 'Test 1',
  'Prueba 2': 'Test 2',
  'Pedido real': 'Real order',
}

export default en
