import { describe, expect, it } from 'vitest'
import { PATTERNS } from './patterns'
import { PATTERN_IDS } from './schema'

describe('pattern catalog', () => {
  it('every pattern (not the principles) has a real example with an https source', () => {
    const missing = PATTERN_IDS.filter((id) => PATTERNS[id].family !== 'principle' && !PATTERNS[id].seenIn?.url.startsWith('https://'))
    expect(missing).toEqual([])
  })
})
