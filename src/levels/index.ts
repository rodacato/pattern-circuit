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

// Texts of the levels, by locale: `<level>/locales/<code>.ts` become `levels.<level>.<key>`, and the vocabulary
// every level shares (`locales/<code>.ts`) becomes `levels.shared.<key>`.
const ownFiles = import.meta.glob<{ default: Catalog }>('./*/locales/*.ts', { eager: true })
const sharedFiles = import.meta.glob<{ default: Catalog }>('./locales/*.ts', { eager: true })

function addCatalog(into: Record<string, Catalog>, locale: string, scope: string, catalog: Catalog) {
  const target = (into[locale] ??= {})
  for (const [key, text] of Object.entries(catalog)) target[`levels.${scope}.${key}`] = text
}

function levelCatalogs(): Record<string, Catalog> {
  const out: Record<string, Catalog> = {}
  for (const [path, m] of Object.entries(ownFiles)) {
    const [, level, , file] = path.split('/')
    addCatalog(out, file.replace(/\.ts$/, ''), level, m.default)
  }
  for (const [path, m] of Object.entries(sharedFiles)) addCatalog(out, path.split('/')[2].replace(/\.ts$/, ''), 'shared', m.default)
  return out
}

export const LEVEL_CATALOGS: Record<string, Catalog> = levelCatalogs()

export { chapterName, CHAPTERS, TRACKS, trackOf } from './tracks'
