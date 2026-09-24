import { describe, expect, it } from 'vitest'
import { PATTERNS } from './patterns'
import { PATTERN_IDS } from './schema'

describe('catálogo de patrones', () => {
  it('cada patrón (no los principios) tiene un ejemplo real con fuente https', () => {
    const missing = PATTERN_IDS.filter((id) => PATTERNS[id].family !== 'principle' && !PATTERNS[id].seenIn?.url.startsWith('https://'))
    expect(missing).toEqual([])
  })
})
