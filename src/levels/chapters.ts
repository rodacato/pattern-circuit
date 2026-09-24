export const CHAPTERS: Record<string, string> = {
  apertura: 'Apertura',
  mostrador: 'El mostrador',
  barra: 'La barra crece',
  'hora-pico': 'Hora pico',
}

export const chapterName = (id: string) => CHAPTERS[id] ?? id
