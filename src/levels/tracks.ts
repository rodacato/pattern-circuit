// A track is its own path: its chapters, in order, and its levels numbered from 0.
// Today there is one. A new track that can be told as a circuit (e.g. whole systems with CQRS,
// events or microservices) is just content: its chapters here and its levels in `levels/`.
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
