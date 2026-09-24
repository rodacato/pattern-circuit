import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Dos sucursales, dos menús': 'Two branches, two menus',
  'El flujo de pedidos que comparten todas las sucursales decide con if qué bebida crear. Abrimos Montaña y le llegan lattes en vez de chocolate.': 'The order flow shared by every branch uses an if to decide which drink to create. We open Mountain and it gets lattes instead of hot chocolate.',
  'Que cada sucursal reciba su bebida y que abrir otra no obligue a tocar el flujo compartido.': 'Make each branch get its own drink, and make opening another not require touching the shared flow.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Crear bebida': 'Create drink',
  'Frappé': 'Frappé',
  'Latte': 'Latte',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Té helado': 'Iced tea',
  'Sucursal': 'Branch',
  'Centro': 'Downtown',
  'Playa': 'Beach',
  'Montaña': 'Mountain',
  'Puerto': 'Harbor',
  'Fábrica única': 'Single factory',
  'Tamaño': 'Size',
  'Temperatura': 'Temperature',
  'Factory Method: cada subclase decide qué crear': 'Factory Method: each subclass decides what to create',
  'El flujo de tomar pedidos es uno solo y llama a create_drink. Cada sucursal es una subclase con su propio molde: el flujo compartido ya no conoce ninguna bebida concreta.': 'There is a single order-taking flow, and it calls create_drink. Each branch is a subclass with its own mold: the shared flow no longer knows any concrete drink.',
  'Singleton: una sola instancia para todos': 'Singleton: a single instance for everyone',
  'Singleton solo garantiza que exista una única fábrica; no aporta nada a este problema. Lo que tenía que variar por sucursal era qué se crea, y la fábrica única sigue decidiendo igual para todas.': 'Singleton only guarantees there is exactly one factory; it adds nothing to this problem. What had to vary by branch was what gets created, and the single factory still decides the same way for all of them.',
  'Builder arma, no elige la clase': 'Builder assembles, it doesn\'t pick the class',
  'Builder sirve para armar un objeto con muchas partes. Aquí el problema no era cuántas piezas tiene la bebida sino qué bebida crear: el if del flujo compartido sigue decidiendo mal.': 'Builder is for assembling an object with many parts. Here the problem wasn\'t how many pieces the drink has but which drink to create: the if in the shared flow still decides wrong.',
  'Abre la sucursal Puerto: solo vende té helado.': 'Open the Harbor branch: it only sells iced tea.',
}

export default en
