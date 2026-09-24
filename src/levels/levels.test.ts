import { describe, expect, it } from 'vitest'
import { evaluate, reachableVariants } from '../engine'
import { CHAPTERS, LEVELS } from '.'
import type { Level } from '../engine'

const solution = (l: Level) => l.sockets.map((s) => ({ id: s.id, pattern: s.inventory.find((p) => s.options[p]?.outcome === 'solves')! }))

describe('registro de niveles', () => {
  it('los niveles van en orden consecutivo desde 0', () => {
    expect(LEVELS.map((l) => l.order)).toEqual(LEVELS.map((_, i) => i))
  })

  it('cada nivel pertenece a un capítulo con nombre', () => {
    for (const l of LEVELS) expect(CHAPTERS[l.chapter], l.id).toBeDefined()
  })

  it('cada nivel con socket tiene exactamente una opción que resuelve', () => {
    for (const l of LEVELS) for (const s of l.sockets) expect(Object.values(s.options).filter((o) => o?.outcome === 'solves'), l.id).toHaveLength(1)
  })

  it('cada opción de un socket está en su inventario (si no, el jugador nunca la vería)', () => {
    for (const l of LEVELS) for (const s of l.sockets) expect(s.inventory, `${l.id}/${s.id}`).toEqual(expect.arrayContaining(Object.keys(s.options)))
  })

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: cada variante alcanzable termina y entrega o pierde cada pulso', (_id, l) => {
    for (const v of reachableVariants(l)) {
      const { metrics } = evaluate(l, v)
      expect(metrics.spawned, JSON.stringify(v)).toBeGreaterThan(0)
      expect(metrics.delivered + metrics.dropped + metrics.cancelled, JSON.stringify(v)).toBeGreaterThan(0)
    }
  })

  it.each(LEVELS.filter((l) => !l.sockets.length).map((l) => [l.id, l] as const))('%s (sin sockets): se gana con todas las reparaciones', (_id, l) => {
    expect(evaluate(l, { repairs: l.repairs.map((r) => r.id) }).won).toBe(true)
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: sin patrón falla y con el correcto gana', (_id, l) => {
    expect(evaluate(l, {}).won).toBe(false)
    const sockets = solution(l)
    expect(evaluate(l, { sockets }).won).toBe(true)
    for (const t of l.changeTickets) expect(evaluate(l, { sockets, ticket: t.id }).won).toBe(true)
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: ningún patrón incorrecto gana', (_id, l) => {
    // Con el resto de sockets resueltos, un patrón incorrecto en cualquiera de ellos impide ganar.
    for (const socket of l.sockets) {
      for (const p of socket.inventory.filter((x) => socket.options[x]?.outcome !== 'solves')) {
        const sockets = solution(l).map((s) => (s.id === socket.id ? { id: s.id, pattern: p } : s))
        expect(evaluate(l, { sockets }).won, `${socket.id}: ${p}`).toBe(false)
      }
    }
  })
})
