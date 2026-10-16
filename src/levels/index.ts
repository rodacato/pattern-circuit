import type { Level } from '../engine'
import type { Catalog } from '../i18n'
import { TRACKS, trackOf } from './tracks'

// Adding a level = creating its folder; the registry discovers and sorts them by track and number.
const modules = import.meta.glob<{ default: Level }>('./*/level.ts', { eager: true })

const trackIndex = (l: Level) => TRACKS.findIndex((t) => t === trackOf(l.chapter))

export const LEVELS: Level[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => trackIndex(a) - trackIndex(b) || a.order - b.order)

// The next level within the same track (finishing a track does not jump to the other).
export function nextLevel(level: Level): Level | undefined {
  const next = LEVELS[LEVELS.indexOf(level) + 1]
  return next && trackOf(next.chapter) === trackOf(level.chapter) ? next : undefined
}

// Content translations: each level may ship an `en.ts` (Spanish text → English).
const english = import.meta.glob<{ default: Catalog }>('./*/en.ts', { eager: true })
export const LEVEL_CATALOGS = { en: Object.assign({}, ...Object.values(english).map((m) => m.default)) as Catalog }

export { chapterName, CHAPTERS, TRACKS, trackOf } from './tracks'
