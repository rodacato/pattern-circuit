export const CHAPTERS: Record<string, string> = {
  apertura: 'Apertura',
  mostrador: 'El mostrador',
  barra: 'La barra crece',
  'hora-pico': 'Hora pico',
  'todo-junto': 'Todo junto',
  arquitectura: 'Arquitectura',
  resiliencia: 'Resiliencia',
  criterio: 'Criterio: cuándo no',
  final: 'La cafetería completa',
}

export const chapterName = (id: string) => CHAPTERS[id] ?? id
