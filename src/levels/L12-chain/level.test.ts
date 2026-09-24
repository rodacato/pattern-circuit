import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'chain-of-responsibility' | 'strategy' | 'observer') => ({ id: 'aprobacion', pattern })

describe('L12 · Chain of Responsibility', () => {
  it('sin patrón: el monto enorme no tiene quién lo atienda', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1 })
  })

  it('sin patrón + supervisor: hay que abrir al cajero', () => {
    expect(evaluate(level, { ticket: 'supervisor' }).touched).toEqual(['cajero'])
  })

  it('la cadena atiende o rechaza con aviso, y el supervisor se inserta sin tocar a nadie', () => {
    expect(evaluate(level, { sockets: [socket('chain-of-responsibility')] }).metrics).toMatchObject({ delivered: 4, dropped: 0 })
    const r = evaluate(level, { sockets: [socket('chain-of-responsibility')], ticket: 'supervisor' })
    expect(r.metrics).toMatchObject({ delivered: 5, dropped: 0, nodesTouched: 0 })
  })

  it('Observer paga el mismo reembolso varias veces', () => {
    expect(evaluate(level, { sockets: [socket('observer')] }).metrics.duplicatesAtSink).toBeGreaterThan(0)
  })
})
