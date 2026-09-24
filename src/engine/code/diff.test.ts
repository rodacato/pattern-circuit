import { describe, expect, it } from 'vitest'
import { collapse, diffLines, diffStats } from './diff'

describe('diff de código', () => {
  it('marca líneas agregadas, quitadas e iguales', () => {
    const d = diffLines('a\nb\nc', 'a\nx\nc\nd')
    expect(d).toEqual([
      { kind: 'same', text: 'a' },
      { kind: 'del', text: 'b' },
      { kind: 'add', text: 'x' },
      { kind: 'same', text: 'c' },
      { kind: 'add', text: 'd' },
    ])
    expect(diffStats(d)).toEqual({ added: 2, removed: 1 })
  })

  it('dos textos iguales no tienen cambios', () => {
    expect(diffStats(diffLines('a\nb', 'a\nb'))).toEqual({ added: 0, removed: 0 })
  })

  it('solo agregar al final no toca lo existente', () => {
    expect(diffLines('a', 'a\nb').filter((l) => l.kind === 'del')).toEqual([])
  })

  it('collapse resume las líneas lejos de los cambios', () => {
    const lines = diffLines('1\n2\n3\n4\n5\n6\n7\n8\n9', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10')
    const chunks = collapse(lines, 2)
    expect(chunks[0]).toEqual({ kind: 'skip', count: 7 })
    expect(chunks.slice(1).map((c) => ('text' in c ? c.text : ''))).toEqual(['8', '9', '10'])
  })
})
