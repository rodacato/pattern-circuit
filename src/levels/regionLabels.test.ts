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
    expect(regionLabel('Counter#hand_over', 'py')).toBe('Counter#hand_over')
    expect(regionLabel('StockDesk#in_stock?:hit', 'py')).toBe('StockDesk#in_stock:hit')
    expect(regionLabel('Order#complete!', 'py')).toBe('Order#complete')
  })

  it.each(LEVELS.flatMap((l) => (['ts', 'py'] as const).map((lang) => [l.id, lang, l] as const)))('%s: Ruby and %s tell the story with the same regions', (_id, lang, level) => {
    const different: string[] = []
    for (const [key, ruby] of Object.entries(level.codeFiles.rb)) {
      const other = level.codeFiles[lang][key]
      if (!other) continue
      const [a, b] = [Object.keys(ruby.regions).sort(), Object.keys(other.regions).sort()]
      if (a.join() !== b.join()) different.push(`${key}: ${[...a.filter((r) => !b.includes(r)).map((r) => `-${r}`), ...b.filter((r) => !a.includes(r)).map((r) => `+${r}`)].join(' ')}`)
    }
    expect(different).toEqual([])
  })
})
