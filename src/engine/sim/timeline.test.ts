import { describe, expect, it } from 'vitest'
import { line, scenario } from '../testing'
import { createSim } from './sim'
import { Timeline } from './timeline'

describe('línea de tiempo', () => {
  it('retroceder y avanzar reproduce exactamente el mismo estado', () => {
    const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } }, { a: { capacity: 1 } })
    const tl = new Timeline(createSim(c, scenario({ at: 0 }, { at: 4 })), 10)
    for (let i = 0; i < 47; i++) tl.forward()
    const at47 = structuredClone(tl.current.state)
    tl.seek(12)
    expect(tl.tick).toBe(12)
    tl.back()
    expect(tl.tick).toBe(11)
    for (let i = 0; i < 36; i++) tl.forward()
    expect(tl.current.state).toEqual(at47)
  })
})
