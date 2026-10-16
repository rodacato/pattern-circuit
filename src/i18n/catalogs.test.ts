import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTranslator } from '.'
import { LEVELS, LEVEL_CATALOGS, TRACKS } from '../levels'
import { levelTextKeys } from '../levels/texts'
import { APP_CATALOGS, CANONICAL_LOCALE, LOCALES } from './registry'

const holes = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join()
const others = LOCALES.filter((l) => l !== CANONICAL_LOCALE)
const canonical = APP_CATALOGS[CANONICAL_LOCALE]

describe.each(LOCALES)('%s: application texts', (locale) => {
  const catalog = APP_CATALOGS[locale]

  it('defines exactly the keys of the canonical locale, none blank', () => {
    expect(Object.keys(catalog).sort()).toEqual(Object.keys(canonical).sort())
    expect(Object.entries(catalog).filter(([, text]) => !text.trim())).toEqual([])
  })

  it('keeps the {holes} of the canonical text', () => {
    expect(Object.keys(canonical).filter((k) => holes(catalog[k]) !== holes(canonical[k]))).toEqual([])
  })
})

describe.each(LOCALES)('%s: level texts', (locale) => {
  const translate = createTranslator([LEVEL_CATALOGS[locale] ?? {}])
  const resolved = (key: string) => translate(key) !== key

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s has every text it shows', (_id, level) => {
    expect(levelTextKeys(level).filter((k) => !resolved(k))).toEqual([])
  })

  it('has no text nobody shows, and keeps the {holes} of the canonical locale', () => {
    const needed = new Set(LEVELS.flatMap(levelTextKeys))
    const shared = (key: string) => key.replace(/^levels\.[^.]+\./, 'levels.shared.')
    const used = new Set([...needed, ...[...needed].map(shared), ...TRACKS.flatMap((t) => [t.name, ...Object.values(t.chapters)])])
    const catalog = LEVEL_CATALOGS[locale] ?? {}
    expect(Object.keys(catalog).filter((k) => !used.has(k) && !k.includes('.node.') && !k.includes('.label.'))).toEqual([])
    expect(Object.keys(catalog).filter((k) => holes(catalog[k]) !== holes(LEVEL_CATALOGS[CANONICAL_LOCALE][k] ?? catalog[k]))).toEqual([])
  })
})

describe('keys written in the source code', () => {
  const read = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const path = join(dir, e.name)
      if (e.isDirectory()) return e.name === 'locales' || e.name === 'levels' ? [] : read(path)
      return /\.tsx?$/.test(e.name) && !e.name.includes('.test.') ? [readFileSync(path, 'utf8')] : []
    })
  const source = read('src').join('\n')
  const referenced = new Set([...source.matchAll(/['"`]((?:ui|cards|render|game|pattern|family|seenIn)\.[A-Za-z0-9.-]+)['"`]/g)].map((m) => m[1]))

  it('exist in the canonical catalog', () => {
    expect([...referenced].filter((k) => !(k in canonical))).toEqual([])
  })

  it('cover the whole canonical catalog (no key is left unused)', () => {
    expect(Object.keys(canonical).filter((k) => !referenced.has(k))).toEqual([])
  })

  it('are all in the registry of a locale folder', () => {
    expect(others.every((l) => l in APP_CATALOGS)).toBe(true)
  })
})
