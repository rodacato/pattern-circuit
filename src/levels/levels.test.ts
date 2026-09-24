import { describe, expect, it } from 'vitest'
import { evaluate, reachableVariants } from '../engine'
import { CHAPTERS, LEVELS } from '.'

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

  it.each(LEVELS.map((l) => [l.id, l] as const))('%s: cada variante alcanzable termina su simulación', (_id, l) => {
    for (const v of reachableVariants(l)) expect(() => evaluate(l, v)).not.toThrow()
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: sin patrón falla y con el correcto gana', (_id, l) => {
    expect(evaluate(l, {}).won).toBe(false)
    const socket = l.sockets[0]
    const pattern = socket.inventory.find((p) => socket.options[p]?.outcome === 'solves')!
    expect(evaluate(l, { socket: { id: socket.id, pattern } }).won).toBe(true)
    for (const t of l.changeTickets) expect(evaluate(l, { socket: { id: socket.id, pattern }, ticket: t.id }).won).toBe(true)
  })

  it.each(LEVELS.filter((l) => l.sockets.length).map((l) => [l.id, l] as const))('%s: ningún patrón incorrecto gana', (_id, l) => {
    const socket = l.sockets[0]
    for (const p of socket.inventory.filter((x) => socket.options[x]?.outcome !== 'solves')) {
      expect(evaluate(l, { socket: { id: socket.id, pattern: p } }).won, p).toBe(false)
    }
  })
})
