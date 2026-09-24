import { describe, expect, it } from 'vitest'
import { parseCode, resolveRegion } from './regions'

describe('código con regiones', () => {
  it('quita los marcadores y resuelve regiones anidadas con caída a la región padre', () => {
    const file = parseCode(['def a', '  # region: A#a', '  if x', '    # region: A#a:x', '    y', '    # endregion', '  end', '  # endregion', 'end'].join('\n'))
    expect(file.text.split('\n')).toEqual(['def a', '  if x', '    y', '  end', 'end'])
    expect(file.regions['A#a']).toEqual({ start: 2, end: 4 })
    expect(resolveRegion(file, 'A#a:x')).toEqual({ start: 3, end: 3 })
    expect(resolveRegion(file, 'A#a:else')).toEqual({ start: 2, end: 4 })
  })

  it('rechaza regiones sin cerrar', () => {
    expect(() => parseCode('# region: X\nfoo')).toThrow(/sin cerrar/)
  })
})
