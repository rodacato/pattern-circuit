import type en from './en'

const texts: Record<keyof typeof en, string> = {
  'node.adapter': 'Adaptador',
  'node.bSize': 'Tamaño',
  'node.charge': 'Cobrar',
  'node.counter': 'Mostrador',
  'node.customer': 'Cliente',
  'node.desk': 'Ventanilla',
  'node.display': 'Pantalla',
  'node.handOver': 'Entregar',
  'node.kitchen': 'Cocina',
  'node.loyalty': 'Lealtad',
  'node.notify': 'Avisar al cliente',
  'node.prepare': 'Preparar',
  'node.queue': 'Cola',
  'node.serve': 'Servir',
  'node.take': 'Tomar pedido',
  'track.patterns': 'Patrones de diseño',
  'chapter.opening': 'Apertura',
  'chapter.counter': 'El mostrador',
  'chapter.bar': 'La barra crece',
  'chapter.rush-hour': 'Hora pico',
  'chapter.all-together': 'Todo junto',
  'chapter.architecture': 'Arquitectura',
  'chapter.resilience': 'Resiliencia',
  'chapter.judgment': 'Criterio: cuándo no',
  'chapter.final': 'La cafetería completa',
  'state.closed': 'cerrado',
  'state.open': 'abierto',
}

export default texts
