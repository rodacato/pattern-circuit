import { describe, expect, it } from 'vitest'
import { regionLabel } from '../engine'
import { LEVELS } from '.'

describe('region labels', () => {
  it('spell the method the way each language does', () => {
    expect(regionLabel('Counter#hand_over', 'rb')).toBe('Counter#hand_over')
    expect(regionLabel('Counter#hand_over', 'ts')).toBe('Counter#handOver')
    expect(regionLabel('Order#complete!', 'ts')).toBe('Order#complete')
    expect(regionLabel('StockDesk#in_stock?:hit', 'ts')).toBe('StockDesk#inStock:hit')
    expect(regionLabel('Port::Payments', 'ts')).toBe('Port::Payments')
  })

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: Ruby and TypeScript tell the story with the same regions', (_id, level) => {
    const different: string[] = []
    for (const [key, ruby] of Object.entries(level.codeFiles.rb)) {
      const ts = level.codeFiles.ts[key]
      if (!ts) continue
      const [a, b] = [Object.keys(ruby.regions).sort(), Object.keys(ts.regions).sort()]
      if (a.join() !== b.join()) different.push(`${key}: ${[...a.filter((r) => !b.includes(r)).map((r) => `-${r}`), ...b.filter((r) => !a.includes(r)).map((r) => `+${r}`)].join(' ')}`)
    }
    expect(different).toEqual([])
  })
})
