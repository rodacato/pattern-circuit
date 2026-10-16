// Creates the files of a new language from the English ones: `npm run i18n:scaffold -- pt-BR "Português (Brasil)" PT`.
// The copied texts are English placeholders to translate; the typed catalogs fail to compile (and the parity tests
// fail) while a key is missing, but a copied key passes, so search the new files for the TODO marker.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TODO = '// TODO(translate): English placeholders'

const levelDirs = (root) => readdirSync(join(root, 'src/levels'), { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(join(root, 'src/levels', e.name, 'locales/en.ts'))).map((e) => e.name)

// `en` area file -> the same file of the new locale, typed against the English keys.
function areaFile(area, source) {
  const entries = source.slice(source.indexOf('{', source.indexOf(`export const ${area}`)) + 1, source.lastIndexOf('} as const'))
  return `${TODO}\nimport type { ${area} as source } from '../en/${area}'\n\nexport const ${area}: Record<keyof typeof source, string> = {${entries}}\n`
}

function levelFile(source) {
  const entries = source.slice(source.indexOf('{', source.indexOf('export default')) + 1, source.lastIndexOf('} as const'))
  return `${TODO}\nimport type en from './en'\n\nconst texts: Record<keyof typeof en, string> = {${entries}}\n\nexport default texts\n`
}

export function scaffold(code, name, short, root = '.') {
  const app = join(root, 'src/i18n/locales')
  if (existsSync(join(app, code))) throw new Error(`The locale ${code} already exists`)
  mkdirSync(join(app, code), { recursive: true })
  writeFileSync(join(app, code, 'meta.ts'), `export default { name: ${JSON.stringify(name)}, short: ${JSON.stringify(short)} }\n`)
  const areas = readdirSync(join(app, 'en')).filter((f) => !['index.ts', 'meta.ts'].includes(f)).map((f) => f.replace(/\.ts$/, ''))
  for (const area of areas) writeFileSync(join(app, code, `${area}.ts`), areaFile(area, readFileSync(join(app, 'en', `${area}.ts`), 'utf8')))
  const index = readFileSync(join(app, 'es-MX/index.ts'), 'utf8')
  writeFileSync(join(app, code, 'index.ts'), index)
  const levels = join(root, 'src/levels')
  for (const dir of levelDirs(root)) writeFileSync(join(levels, dir, 'locales', `${code}.ts`), levelFile(readFileSync(join(levels, dir, 'locales/en.ts'), 'utf8')))
  writeFileSync(join(levels, 'locales', `${code}.ts`), levelFile(readFileSync(join(levels, 'locales/en.ts'), 'utf8')))
  return { areas, levels: levelDirs(root).length }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [code, name, short] = process.argv.slice(2)
  if (!code || !name || !short) throw new Error('Usage: npm run i18n:scaffold -- <code> "<name>" <short>')
  const { areas, levels } = scaffold(code, name, short)
  console.log(`Created src/i18n/locales/${code} (${areas.length} areas) and ${levels + 1} level files. Translate them and delete the TODO markers.`)
}
