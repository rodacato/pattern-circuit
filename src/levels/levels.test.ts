import { describe, expect, it } from 'vitest'
import { evaluate, PATTERN_IDS, reachableVariants } from '../engine'
import { CHAPTERS, LEVELS, nextLevel, TRACKS, trackOf } from '.'
import type { Level } from '../engine'

const solution = (l: Level) => l.sockets.map((s) => ({ id: s.id, pattern: s.inventory.find((p) => s.options[p]?.outcome === 'solves')! }))

describe('registro de niveles', () => {
  it.each(TRACKS.map((t) => [t.name, t] as const))('%s: niveles consecutivos desde 0 y capítulos en orden', (_name, track) => {
    const levels = LEVELS.filter((l) => trackOf(l.chapter) === track)
    expect(levels.map((l) => l.order)).toEqual(levels.map((_, i) => i))
    expect([...new Set(levels.map((l) => l.chapter))]).toEqual(Object.keys(track.chapters))
  })

  it('los ids de nivel son únicos (el progreso guardado los usa como clave)', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length)
  })

  it('cada capítulo pertenece a un solo tema y cada nivel a un capítulo con nombre', () => {
    const ids = TRACKS.flatMap((t) => Object.keys(t.chapters))
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of LEVELS) expect(CHAPTERS[l.chapter], l.id).toBeDefined()
  })

  it('el siguiente nivel es el próximo del mismo tema; el último no tiene siguiente', () => {
    expect(nextLevel(LEVELS[0])).toBe(LEVELS[1])
    expect(nextLevel(LEVELS.at(-1)!)).toBeUndefined()
  })

  it('cada patrón del catálogo se enseña en algún nivel y se puede probar en algún socket', () => {
    const taught = new Set(LEVELS.flatMap((l) => l.sockets.flatMap((s) => s.inventory.filter((p) => s.options[p]?.outcome === 'solves'))))
    expect(PATTERN_IDS.filter((p) => !taught.has(p))).toEqual([])
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
