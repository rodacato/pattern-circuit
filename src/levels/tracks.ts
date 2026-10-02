// Un tema (track) es un recorrido propio: sus capítulos, en orden, y sus niveles numerados desde 0.
// Hoy hay uno. Un tema nuevo que se pueda contar como circuito (p. ej. sistemas completos con CQRS,
// eventos o microservicios) es solo contenido: sus capítulos aquí y sus niveles en `levels/`.
export type Track = { id: string; name: string; chapters: Record<string, string> }

export const TRACKS: Track[] = [
  {
    id: 'patterns',
    name: 'Patrones de diseño',
    chapters: {
      opening: 'Apertura',
      counter: 'El mostrador',
      bar: 'La barra crece',
      'rush-hour': 'Hora pico',
      'all-together': 'Todo junto',
      architecture: 'Arquitectura',
      resilience: 'Resiliencia',
      judgment: 'Criterio: cuándo no',
      final: 'La cafetería completa',
    },
  },
]

export const CHAPTERS: Record<string, string> = Object.assign({}, ...TRACKS.map((t) => t.chapters))

export const chapterName = (id: string) => CHAPTERS[id] ?? id

export const trackOf = (chapter: string): Track | undefined => TRACKS.find((t) => chapter in t.chapters)
