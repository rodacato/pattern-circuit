import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import { LEVELS } from '../../levels'
import { initialFlow } from '../flow/levelFlow'
import { hintLadder } from './hints'

const level = (id: string) => LEVELS.find((l) => l.id === id)!

describe('pistas', () => {
  it('van de una pregunta guía a la respuesta, pasando por la familia y un descarte', () => {
    const l = level('L01-strategy')
    const hints = hintLadder(l, { ...initialFlow(), stage: 'choose' }, evaluate(l, {}))
    expect(hints).toHaveLength(4)
    expect(hints[0]).toContain('se pierden pedidos')
    expect(hints[1]).toContain('comportamiento')
    expect(hints[2]).toMatch(/^Descarta (Observer|Decorator)/)
    expect(hints[3]).toBe('Prueba con Strategy.')
  })

  it('con varios sockets apuntan al primero sin resolver y lo nombran', () => {
    const l = level('L15-sucursales-y-pagos')
    const [first, second] = l.sockets
    const solved = first.inventory.find((p) => first.options[p]?.outcome === 'solves')!
    const flow = { ...initialFlow(), stage: 'choose' as const, plugs: { [first.id]: { socketId: first.id, pattern: solved, outcome: 'solves' as const } } }
    expect(hintLadder(l, flow).at(-1)).toContain(`socket "${second.label}"`)
  })

  it('cada nivel con sockets tiene al menos pregunta, familia y respuesta', () => {
    for (const l of LEVELS.filter((x) => x.sockets.length)) expect(hintLadder(l, { ...initialFlow(), stage: 'choose' }).length, l.id).toBeGreaterThanOrEqual(3)
  })
})
