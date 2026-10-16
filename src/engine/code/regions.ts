// Code fragments with `# region: Class#method` / `# endregion` markers (nestable).
// The marker is a comment of the language: `#` in Ruby and Python, `//` in TypeScript.
import type { CodeLang } from '../schema'

export type CodeRegion = { start: number; end: number } // 1-based lines, inclusive
export type CodeFile = { text: string; regions: Record<string, CodeRegion> }

const OPEN = /^\s*(?:#|\/\/)\s*region:\s*(\S+)\s*$/
const CLOSE = /^\s*(?:#|\/\/)\s*endregion\s*$/

export function parseCode(source: string): CodeFile {
  const lines: string[] = []
  const regions: Record<string, CodeRegion> = {}
  const open: { name: string; start: number }[] = []

  for (const raw of source.replace(/\s+$/, '').split('\n')) {
    const opening = raw.match(OPEN)
    if (opening) {
      open.push({ name: opening[1], start: lines.length + 1 })
      continue
    }
    if (CLOSE.test(raw)) {
      const r = open.pop()
      if (!r) throw new Error(`endregion without a region at line ${lines.length + 1}`)
      regions[r.name] = { start: r.start, end: lines.length }
      continue
    }
    lines.push(raw)
  }
  if (open.length) throw new Error(`unclosed region: ${open.map((r) => r.name).join(', ')}`)
  return { text: lines.join('\n'), regions }
}

// `Cashier#charge:cash` falls back to `Cashier#charge` if the branch has no region of its own.
export function resolveRegion(file: CodeFile, ref: string | undefined): CodeRegion | undefined {
  if (!ref) return undefined
  return file.regions[ref] ?? file.regions[ref.split(':')[0]]
}

// Region ids follow Ruby's method names (`Counter#hand_over`, `Order#complete!`); each language shows the name
// the way its own code spells it (Python keeps snake_case but has no `!` or `?`).
export function regionLabel(ref: string, lang: CodeLang): string {
  if (lang === 'rb') return ref
  const spell = (method: string) => (lang === 'ts' ? method.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase()) : method)
  return ref.replace(/#([A-Za-z0-9_]+)[!?]?/, (_, method: string) => `#${spell(method)}`)
}
