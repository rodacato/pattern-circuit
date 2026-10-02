// Code fragments with `# region: Class#method` / `# endregion` markers (nestable).
// The marker is a comment of the language: `#` in Ruby, `//` in TypeScript.
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
      if (!r) throw new Error(`endregion sin region en la línea ${lines.length + 1}`)
      regions[r.name] = { start: r.start, end: lines.length }
      continue
    }
    lines.push(raw)
  }
  if (open.length) throw new Error(`region sin cerrar: ${open.map((r) => r.name).join(', ')}`)
  return { text: lines.join('\n'), regions }
}

// `Cashier#charge:cash` falls back to `Cashier#charge` if the branch has no region of its own.
export function resolveRegion(file: CodeFile, ref: string | undefined): CodeRegion | undefined {
  if (!ref) return undefined
  return file.regions[ref] ?? file.regions[ref.split(':')[0]]
}
