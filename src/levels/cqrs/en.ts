import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Mil pantallas, un mostrador': 'A thousand displays, one counter',
  'Las pantallas de la cafetería preguntan sin parar por los pedidos, y el mostrador registra pedidos nuevos. Todos usan el mismo modelo, que atiende de a uno: las lecturas hacen fila con las escrituras.': 'The coffee shop displays keep asking about orders nonstop, and the counter registers new orders. They all use the same model, which handles one at a time: reads wait in line with writes.',
  'Que leer no bloquee a escribir: que la fila en cualquier nodo no pase de tres.': 'Keep reading from blocking writing: the line at any node must not go over three.',
  'Pantallas': 'Displays',
  'Mostrador': 'Counter',
  'Modelo de pedidos': 'Orders model',
  'Tablero': 'Board',
  'Registrado': 'Registered',
  'Escritura': 'Write',
  'Proyección': 'Projection',
  'Vista de lectura': 'Read view',
  'Ventanilla': 'Window',
  '📺 tablero actualizado': '📺 board updated',
  '✔ registrado': '✔ registered',
  'Modelo': 'Model',
  'CQRS: escribir y leer por caminos separados': 'CQRS: write and read along separate paths',
  'El lado de escritura valida y guarda, de a uno. Cada cambio actualiza una proyección: una vista ya lista para leer. Las pantallas consultan esa vista, que responde rápido y sin fila. A cambio, la vista puede ir un instante detrás de la escritura.': 'The write side validates and saves, one at a time. Each change updates a projection: a view that is ready to read. The displays query that view, which answers fast and with no line. In exchange, the view may lag a moment behind the write.',
  'Una instancia, la misma fila': 'One instance, the same line',
  'Compartir una única instancia del modelo no cambia que lecturas y escrituras esperen en la misma fila.': 'Sharing a single instance of the model doesn\'t change the fact that reads and writes wait in the same line.',
  'Facade no separa caminos': 'Facade doesn\'t split paths',
  'Una ventanilla única delante del modelo es otra puerta hacia la misma fila.': 'A single window in front of the model is just another door to the same line.',
  'Ver pedidos': 'View orders',
  'Pedido nuevo 1': 'New order 1',
  'Pedido nuevo 2': 'New order 2',
  'Pedido nuevo 3': 'New order 3',
}

export default en
