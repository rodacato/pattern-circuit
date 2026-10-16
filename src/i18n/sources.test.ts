import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Components, render and game code never contain prose: every visible text is a catalog key.
const DIRS = ['src/ui', 'src/ui/cards', 'src/render', 'src/render/skins', 'src/game/learning', 'src/game/session', 'src/game/flow', 'src/game/playback']
const FILES = ['src/engine/patterns.ts', 'src/engine/seenIn.ts']
const sources = [
  ...DIRS.flatMap((d) => readdirSync(d).filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.')).map((f) => join(d, f))),
  ...FILES,
]

const withoutComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
const BRAND = 'Pattern Circuit'
const KEY = /^[a-z][A-Za-z0-9]*(\.[A-Za-z0-9-]+)+$/
// Strings that look like prose but are code: CSS classes, import paths, regexes, formats.
// Lines that hold identifiers, class names or storage keys rather than text.
const CODE_LINE = ['className', 'querySelector', 'classList', '.css', 'getItem', 'setItem', 'import ', " from '"]
const NOT_PROSE = [/^\.{0,2}\//, /^https?:/, /sans-serif|monospace/, /^noopener noreferrer$/]

describe('no prose in code', () => {
  it.each(sources.map((f) => [f]))('%s', (file) => {
    const code = withoutComments(readFileSync(file, 'utf8'))
    const prose: string[] = []

    for (const m of code.matchAll(/\b(?:t|msg|N)\(\s*(['"`])([^'"`]*)\1/g)) if (!KEY.test(m[2])) prose.push(`not a key: ${m[2]}`)
    for (const m of code.matchAll(/<[A-Za-z][^<>]*[^=-]>\s*([^<>{}\n=()]*[A-Za-zÀ-ÿ¿¡]{2,}[^<>{}\n=()]*)\s*<\//g)) if (m[1].trim() !== BRAND) prose.push(`JSX text: ${m[1].trim()}`)
    for (const m of code.matchAll(/\b(?:aria-label|title|alt|placeholder)=(?:"([^"]*[A-Za-zÀ-ÿ]{2,}[^"]*)"|'([^']*[A-Za-zÀ-ÿ]{2,}[^']*)')/g)) prose.push(`attribute: ${m[1] ?? m[2]}`)
    for (const line of code.split('\n')) {
      if (CODE_LINE.some((word) => line.includes(word))) continue
      for (const m of line.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
        const text = m[2].replace(/\$\{[^}]*\}/g, '')
        if (/[A-Za-zÀ-ÿ¿¡]{2,}[\s,.;!?¿¡…→·]+[A-Za-zÀ-ÿ¿¡]{2,}/.test(text) && !NOT_PROSE.some((r) => r.test(text)) && !KEY.test(text) && text.trim() !== BRAND) prose.push(`literal: ${m[2]}`)
      }
    }
    expect([...new Set(prose)]).toEqual([])
  })
})
