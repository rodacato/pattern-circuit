// Diferencias línea a línea entre dos versiones del código (LCS clásico: los archivos son de ~100 líneas).
export type DiffLine = { kind: 'same' | 'add' | 'del'; text: string }
export type DiffChunk = DiffLine | { kind: 'skip'; count: number }

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split('\n')
  const b = after.split('\n')
  // lcs[i][j] = largo de la subsecuencia común más larga entre a[i..] y b[j..]
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
  }
  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ kind: 'same', text: a[i] })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) out.push({ kind: 'del', text: a[i++] })
    else out.push({ kind: 'add', text: b[j++] })
  }
  while (i < a.length) out.push({ kind: 'del', text: a[i++] })
  while (j < b.length) out.push({ kind: 'add', text: b[j++] })
  return out
}

// Deja `context` líneas iguales alrededor de cada cambio y resume el resto.
export function collapse(lines: DiffLine[], context = 3): DiffChunk[] {
  const near = lines.map((_, i) => lines.slice(Math.max(0, i - context), i + context + 1).some((l) => l.kind !== 'same'))
  const out: DiffChunk[] = []
  for (let i = 0; i < lines.length; i++) {
    if (near[i]) out.push(lines[i])
    else {
      const last = out[out.length - 1]
      if (last?.kind === 'skip') last.count++
      else out.push({ kind: 'skip', count: 1 })
    }
  }
  return out
}

export const diffStats = (lines: DiffLine[]) => ({
  added: lines.filter((l) => l.kind === 'add').length,
  removed: lines.filter((l) => l.kind === 'del').length,
})
