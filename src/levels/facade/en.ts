import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'La cocina por dentro': 'Inside the kitchen',
  'Para hacer un latte hay que usar molino, máquina y espumador en orden. El mostrador lo hace bien; la app de delivery copió los pasos y se saltó el espumador: sus lattes salen sin espuma.':
    'To make a latte you use the grinder, the machine and the frother, in order. The counter gets it right; the delivery app copied the steps and skipped the frother: its lattes come out with no foam.',
  'Que cualquier cliente pida un latte correcto sin conocer las máquinas, y que cambiar la cocina se haga en un solo lugar.':
    'Let any client order a proper latte without knowing the machines, and make kitchen changes happen in a single place.',
  'Mostrador': 'Counter',
  'App delivery': 'Delivery app',
  'Molino': 'Grinder',
  'Máquina': 'Machine',
  'Espumador': 'Frother',
  'Molino (app)': 'Grinder (app)',
  'Máquina (app)': 'Machine (app)',
  'Entregar': 'Hand over',
  'Precalentar': 'Preheat',
  'Cocina': 'Kitchen',
  'Adaptador': 'Adapter',
  'Proxy': 'Proxy',
  'Facade: una puerta simple a un subsistema complicado': 'Facade: a simple door to a complicated subsystem',
  'Mostrador y app piden "un latte" a la fachada, y solo ella conoce el orden de las máquinas. La orquestación vive en un único lugar: nadie se salta un paso y un cambio en la cocina se hace una vez.':
    'The counter and the app ask the facade for "a latte", and only the facade knows the order of the machines. The orchestration lives in one place: nobody skips a step, and a kitchen change is made once.',
  'Adapter traduce la llamada, no la completa': 'Adapter translates the call, it doesn\'t complete it',
  'Adaptar el pedido de la app al formato del mostrador no cambia que la app siga orquestando las máquinas por su cuenta, sin espumador.':
    'Adapting the app\'s order to the counter\'s format doesn\'t change the fact that the app still orchestrates the machines on its own, without the frother.',
  'Proxy controla el acceso, no la receta': 'Proxy controls access, not the recipe',
  'Un intermediario frente a la máquina puede registrar o limitar su uso, pero no sabe que a la app le falta un paso de la receta.':
    'A middleman in front of the machine can log or limit its use, but it doesn\'t know the app is missing a step of the recipe.',
  'La máquina nueva necesita precalentarse antes de extraer.': 'The new machine needs to preheat before extracting.',
  'Latte': 'Latte',
  'Latte (app)': 'Latte (app)',
}

export default en
