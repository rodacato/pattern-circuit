import type { Level } from '../engine'
import type { Catalog } from '../i18n'
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

// Traducciones del contenido: cada nivel puede traer `en.ts` (texto en español → inglés).
const english = import.meta.glob<{ default: Catalog }>('./*/en.ts', { eager: true })
export const LEVEL_CATALOGS = { en: Object.assign({}, ...Object.values(english).map((m) => m.default)) as Catalog }

export { chapterName, CHAPTERS, TRACKS, trackOf } from './tracks'
