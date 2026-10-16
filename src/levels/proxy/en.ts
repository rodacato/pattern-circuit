import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'El almacén está lejos': 'The warehouse is far away',
  'Cada pedido pregunta al almacén remoto si hay stock. El almacén tarda y atiende de a uno: se forma una fila enorme, aunque casi siempre preguntamos lo mismo.':
    'Every order asks the remote warehouse whether there\'s stock. The warehouse is slow and serves one at a time: a huge line builds up, even though we almost always ask the same thing.',
  'Que la fila frente al almacén no pase de dos consultas sin cambiar a quien pregunta.':
    'Keep the line at the warehouse to two queries at most, without changing whoever asks.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Almacén remoto': 'Remote warehouse',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Proxy': 'Proxy',
  'Ventanilla': 'Window',
  'Inventario': 'Inventory',
  'Proxy: un sustituto que controla el acceso': 'Proxy: a stand-in that controls access',
  'El proxy tiene la misma interfaz que el almacén, así que quien pregunta no nota el cambio. Solo viaja al almacén cuando no conoce la respuesta; lo demás rebota en el proxy sin hacer fila. El precio: la respuesta guardada puede quedar vieja, así que un proxy real le pone caducidad.':
    'The proxy has the same interface as the warehouse, so whoever asks doesn\'t notice the change. It only goes to the warehouse when it doesn\'t know the answer; everything else bounces off the proxy without joining the line. The cost: the stored answer can go stale, so a real proxy gives it an expiration.',
  'Singleton no ahorra viajes': 'Singleton doesn\'t save trips',
  'Tener una sola instancia del cliente remoto no cambia cuántas veces se consulta el almacén. La fila sigue igual de larga.':
    'Having a single instance of the remote client doesn\'t change how many times the warehouse is queried. The line is just as long.',
  'Facade simplifica, no evita el trabajo': 'Facade simplifies, it doesn\'t avoid the work',
  'Poner una ventanilla única delante del almacén no reduce las consultas: cada pedido sigue llegando hasta el almacén.':
    'Putting a single window in front of the warehouse doesn\'t reduce the queries: every order still reaches the warehouse.',
  'café': 'coffee',
  'leche': 'milk',
}

export default en
