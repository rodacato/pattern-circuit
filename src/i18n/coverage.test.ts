import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FAMILY_NAMES, PATTERNS } from '../engine'
import { LEVEL_CATALOGS, LEVELS, TRACKS } from '../levels'
import { levelTexts } from '../levels/texts'
import { EN } from './en'
import { extractTexts } from './texts'

// Every text the player sees has an English translation. If one is missing, the test says which and where.
const SOURCES = ['src/ui', 'src/ui/cards', 'src/render', 'src/render/skins', 'src/game/learning', 'src/game/session']
const sourceFiles = SOURCES.flatMap((d) => readdirSync(d).filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.')).map((f) => join(d, f)))
const missing = (texts: string[], catalog: Record<string, string>) => [...new Set(texts)].filter((t) => !(t in catalog))

describe('English translation', () => {
  it('texts of the interface, the render and the game', () => {
    expect(missing(sourceFiles.flatMap((f) => extractTexts(readFileSync(f, 'utf8'))), EN)).toEqual([])
  })

  it('catalog of patterns, families and tracks', () => {
    const texts = [
      ...Object.values(PATTERNS).flatMap((p) => [p.name, p.gist, ...(p.seenIn ? [p.seenIn.example, p.seenIn.text] : [])]),
      ...Object.values(FAMILY_NAMES),
      ...TRACKS.flatMap((t) => [t.name, ...Object.values(t.chapters)]),
    ]
    expect(missing(texts, EN)).toEqual([])
  })

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s', (_id, level) => {
    expect(missing(levelTexts(level), { ...EN, ...LEVEL_CATALOGS.en })).toEqual([])
  })

  it('{x} placeholders are kept in each translation', () => {
    const catalog = { ...EN, ...LEVEL_CATALOGS.en }
    const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
    expect(Object.entries(catalog).filter(([es, en]) => holes(es) !== holes(en)).map(([es]) => es)).toEqual([])
  })
})
