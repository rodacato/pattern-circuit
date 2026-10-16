import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CourseManifest } from '../course-kit'
import { LEVELS } from '../levels'
import { buildManifest } from './manifest'

const FILE = 'public/course.json'

describe('course.json', () => {
  const manifest = buildManifest()

  it('is valid and lists every level as a unit, in order', () => {
    expect(CourseManifest.safeParse(manifest).success).toBe(true)
    expect(manifest.units.map((u) => u.id)).toEqual(LEVELS.map((l) => l.id))
  })

  it('has every text in every locale', () => {
    for (const unit of manifest.units) for (const locale of manifest.locales) expect(unit.title[locale]).not.toBe(unit.id)
    expect(manifest.title).toEqual({ 'es-MX': 'Patrones de diseño', en: 'Design patterns' })
  })

  it('is the published file: run `UPDATE_MANIFEST=1 npm test` after changing a level, a text or the version', () => {
    const json = `${JSON.stringify(manifest, null, 2)}\n`
    if (process.env.UPDATE_MANIFEST) writeFileSync(FILE, json)
    expect(readFileSync(FILE, 'utf8')).toBe(json)
  })
})
