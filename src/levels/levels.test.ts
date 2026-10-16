import { describe, expect, it } from 'vitest'
import { evaluate, PATTERN_IDS, reachableVariants } from '../engine'
import { CHAPTERS, LEVELS, nextLevel, TRACKS, trackOf } from '.'
import type { Level } from '../engine'

const solution = (l: Level) => l.sockets.map((s) => ({ id: s.id, pattern: s.inventory.find((p) => s.options[p]?.outcome === 'solves')! }))

describe('level registry', () => {
  it.each(TRACKS.map((t) => [t.name, t] as const))('%s: consecutive levels from 0 and chapters in order', (_name, track) => {
    const levels = LEVELS.filter((l) => trackOf(l.chapter) === track)
    expect(levels.map((l) => l.order)).toEqual(levels.map((_, i) => i))
    expect([...new Set(levels.map((l) => l.chapter))]).toEqual(Object.keys(track.chapters))
  })

  it('level ids are unique (saved progress uses them as a key)', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length)
  })

  it('each chapter belongs to a single track and each level to a named chapter', () => {
    const ids = TRACKS.flatMap((t) => Object.keys(t.chapters))
    expect(new Set(ids).size).toBe(ids.length)
    for (const l of LEVELS) expect(CHAPTERS[l.chapter], l.id).toBeDefined()
  })

  it('the next level is the following one in the same track; the last has no next', () => {
    expect(nextLevel(LEVELS[0])).toBe(LEVELS[1])
    expect(nextLevel(LEVELS.at(-1)!)).toBeUndefined()
  })

  it('every catalog pattern is taught in some level and can be tried in some socket', () => {
    const taught = new Set(LEVELS.flatMap((l) => l.sockets.flatMap((s) => s.inventory.filter((p) => s.options[p]?.outcome === 'solves'))))
    expect(PATTERN_IDS.filter((p) => !taught.has(p))).toEqual([])
  })

  it('every level with a socket has exactly one option that solves it', () => {
    for (const l of LEVELS) for (const s of l.sockets) expect(Object.values(s.options).filter((o) => o?.outcome === 'solves'), l.id).toHaveLength(1)
  })

  it('every option of a socket is in its inventory (otherwise the player would never see it)', () => {
    for (const l of LEVELS) for (const s of l.sockets) expect(s.inventory, `${l.id}/${s.id}`).toEqual(expect.arrayContaining(Object.keys(s.options)))
  })

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: every reachable variant ends and delivers or drops every pulse', (_id, l) => {
    for (const v of reachableVariants(l)) {
      const { metrics } = evaluate(l, v)
      expect(metrics.spawned, JSON.stringify(v)).toBeGreaterThan(0)
      expect(metrics.delivered + metrics.dropped + metrics.cancelled, JSON.stringify(v)).toBeGreaterThan(0)
    }
  })

  it.each(LEVELS.filter((l) => !l.sockets.length).map((l) => [l.id, l] as const))('%s (no sockets): wins with all the repairs', (_id, l) => {
    expect(evaluate(l, { repairs: l.repairs.map((r) => r.id) }).won).toBe(true)
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: fails without a pattern and wins with the right one', (_id, l) => {
    expect(evaluate(l, {}).won).toBe(false)
    const sockets = solution(l)
    expect(evaluate(l, { sockets }).won).toBe(true)
    for (const t of l.changeTickets) expect(evaluate(l, { sockets, ticket: t.id }).won).toBe(true)
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: no wrong pattern wins', (_id, l) => {
    // With the other sockets resolved, a wrong pattern in any of them prevents winning.
    for (const socket of l.sockets) {
      for (const p of socket.inventory.filter((x) => socket.options[x]?.outcome !== 'solves')) {
        const sockets = solution(l).map((s) => (s.id === socket.id ? { id: s.id, pattern: p } : s))
        expect(evaluate(l, { sockets }).won, `${socket.id}: ${p}`).toBe(false)
      }
    }
  })
})
