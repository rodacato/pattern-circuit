import type { Level } from '../engine'
import { TRACKS, trackOf } from './tracks'

// Agregar un nivel = crear su carpeta; el registro los descubre y los ordena por tema y número.
const modules = import.meta.glob<{ default: Level }>('./*/level.ts', { eager: true })

const trackIndex = (l: Level) => TRACKS.findIndex((t) => t === trackOf(l.chapter))

export const LEVELS: Level[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => trackIndex(a) - trackIndex(b) || a.order - b.order)

// El siguiente nivel dentro del mismo tema (al terminar un tema no se salta al otro).
export function nextLevel(level: Level): Level | undefined {
  const next = LEVELS[LEVELS.indexOf(level) + 1]
  return next && trackOf(next.chapter) === trackOf(level.chapter) ? next : undefined
}

export { chapterName, CHAPTERS, TRACKS, trackOf } from './tracks'
