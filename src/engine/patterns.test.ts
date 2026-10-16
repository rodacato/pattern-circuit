import { describe, expect, it } from 'vitest'
import { PATTERNS, seenInFor } from './patterns'
import { PATTERN_IDS } from './schema'

describe('pattern catalog', () => {
  it('every pattern (not the principles) has a real example with an https source', () => {
    const missing = PATTERN_IDS.filter((id) => PATTERNS[id].family !== 'principle' && !PATTERNS[id].seenIn?.url.startsWith('https://'))
    expect(missing).toEqual([])
  })

  it('every pattern also has a Python example, and each language gets its own', () => {
    const missing = PATTERN_IDS.filter((id) => PATTERNS[id].family !== 'principle' && !PATTERNS[id].seenInPython?.url.startsWith('https://'))
    expect(missing).toEqual([])
    expect(seenInFor('strategy', 'py')).toMatchObject({ lang: 'py', info: PATTERNS.strategy.seenInPython })
    expect(seenInFor('strategy', 'rb')).toMatchObject({ lang: 'rb', info: PATTERNS.strategy.seenIn })
    expect(seenInFor('strategy', 'ts')?.lang).toBe('rb') // TypeScript has no examples of its own yet
    expect(seenInFor('keep-simple', 'py')).toBeUndefined()
  })
})
