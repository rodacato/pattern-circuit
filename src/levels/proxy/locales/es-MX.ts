import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'El almacén está lejos',
  'brief.problem': 'Cada pedido pregunta al almacén remoto si hay stock. El almacén tarda y atiende de a uno: se forma una fila enorme, aunque casi siempre preguntamos lo mismo.',
  'brief.goal': 'Que la fila frente al almacén no pase de dos consultas sin cambiar a quien pregunta.',
  'node.warehouse': 'Almacén remoto',
  'socket.inventory': 'Inventario',
  'option.inventory.proxy.title': 'Proxy: un sustituto que controla el acceso',
  'option.inventory.proxy.body': 'El proxy tiene la misma interfaz que el almacén, así que quien pregunta no nota el cambio. Solo viaja al almacén cuando no conoce la respuesta; lo demás rebota en el proxy sin hacer fila. El precio: la respuesta guardada puede quedar vieja, así que un proxy real le pone caducidad.',
  'option.inventory.singleton.title': 'Singleton no ahorra viajes',
  'option.inventory.singleton.body': 'Tener una sola instancia del cliente remoto no cambia cuántas veces se consulta el almacén. La fila sigue igual de larga.',
  'option.inventory.facade.title': 'Facade simplifica, no evita el trabajo',
  'option.inventory.facade.body': 'Poner una ventanilla única delante del almacén no reduce las consultas: cada pedido sigue llegando hasta el almacén.',
  'scenario.main.0': 'café',
  'scenario.main.1': 'leche',
  'scenario.main.2': 'café',
  'scenario.main.3': 'café',
  'scenario.main.4': 'leche',
  'scenario.main.5': 'café',
  'node.proxy': 'Proxy',
}

export default texts
