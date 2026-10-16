import { describe, expect, it } from 'vitest'
import { collapse, diffLines, diffStats } from './diff'

describe('code diff', () => {
  it('marks added, removed and equal lines', () => {
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

  it('two equal texts have no changes', () => {
    expect(diffStats(diffLines('a\nb', 'a\nb'))).toEqual({ added: 0, removed: 0 })
  })

  it('only appending at the end does not touch what exists', () => {
    expect(diffLines('a', 'a\nb').filter((l) => l.kind === 'del')).toEqual([])
  })

  it('collapse summarizes the lines far from the changes', () => {
    const lines = diffLines('1\n2\n3\n4\n5\n6\n7\n8\n9', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10')
    const chunks = collapse(lines, 2)
    expect(chunks[0]).toEqual({ kind: 'skip', count: 7 })
    expect(chunks.slice(1).map((c) => ('text' in c ? c.text : ''))).toEqual(['8', '9', '10'])
  })
})
