import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

describe('L00 · Open the café', () => {
  const l = level

  it('without the wire, orders are lost in Preparar', () => {
    const r = evaluate(l, {})
    expect(r.metrics).toMatchObject({ delivered: 0, dropped: 3 })
    expect(r.won).toBe(false)
  })

  it('with the wire repaired, it wins', () => {
    const r = evaluate(l, { repairs: ['connect-handover'] })
    expect(r.metrics).toMatchObject({ delivered: 3, dropped: 0 })
    expect(r.won).toBe(true)
  })
})
