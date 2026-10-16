import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { APP_CATALOGS, LOCALES } from './registry'

const keysIn = (file: string) => [...readFileSync(file, 'utf8').matchAll(/^\s+'([^']+)':/gm)].map((m) => m[1])

describe('adding a language', () => {
  it('is the folders of locales/: the registry lists exactly what is there', () => {
    const folders = readdirSync('src/i18n/locales', { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    expect([...LOCALES].sort()).toEqual(folders.sort())
    expect(Object.keys(APP_CATALOGS).sort()).toEqual(folders.sort())
  })

  it('is files only: the scaffold copies every English key of the application and of each level', async () => {
    const root = resolve('node_modules/.cache/scaffold-test')
    rmSync(root, { recursive: true, force: true })
    const copy = (from: string) => cpSync(from, join(root, from), { recursive: true })
    copy('src/i18n/locales')
    copy('src/levels/locales')
    for (const dir of readdirSync('src/levels', { withFileTypes: true })) if (dir.isDirectory() && dir.name !== 'locales') copy(join('src/levels', dir.name, 'locales'))

    const { scaffold } = (await import(pathToFileURL(resolve('scripts/i18n-scaffold.mjs')).href)) as { scaffold: (code: string, name: string, short: string, root: string) => { areas: string[]; levels: number } }
    const result = scaffold('xx', 'Test language', 'XX', root)

    for (const area of result.areas) expect(keysIn(join(root, 'src/i18n/locales/xx', `${area}.ts`)).sort()).toEqual(keysIn(join(root, 'src/i18n/locales/en', `${area}.ts`)).sort())
    expect(existsSync(join(root, 'src/i18n/locales/xx/meta.ts'))).toBe(true)
    expect(result.levels).toBeGreaterThan(20)
    for (const dir of readdirSync(join(root, 'src/levels'), { withFileTypes: true })) {
      if (!dir.isDirectory()) continue
      const generated = join(root, 'src/levels', dir.name, 'locales/xx.ts')
      if (existsSync(generated)) expect(keysIn(generated).sort()).toEqual(keysIn(join(root, 'src/levels', dir.name, 'locales/en.ts')).sort())
    }
    expect(() => scaffold('xx', 'Again', 'XX', root)).toThrow()
    rmSync(root, { recursive: true, force: true })
  })
})
