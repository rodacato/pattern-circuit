import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../levels'
import { emptyProgress, firstUnfinished, KeyValueProgressStore, LEGACY_LEVEL_IDS, LEGACY_SOCKET_IDS, migrateLevelIds, noteKey, parseNoteKey, withCompleted, withNote, withNotes, withPrediction } from './progress'

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
}

describe('progress', () => {
  it('marking completed and recording notes is idempotent', () => {
    const p = withNote(withCompleted(withCompleted(emptyProgress(), 'L1'), 'L1'), noteKey('L1', 'observer'))
    expect(withNote(p, 'L1:observer')).toBe(p)
    expect(p).toMatchObject({ version: 1, completed: ['L1'], notes: ['L1:observer'] })
  })

  it('saves to and restores from storage', () => {
    const storage = fakeStorage()
    const store = new KeyValueProgressStore(storage)
    store.save(withCompleted(emptyProgress(), 'L0'))
    expect(new KeyValueProgressStore(storage).load().completed).toEqual(['L0'])
  })

  it('corrupt data or data from another version start from scratch', () => {
    expect(new KeyValueProgressStore(fakeStorage({ 'pattern-circuit:progress': '{roto' })).load()).toEqual(emptyProgress())
    const old = JSON.stringify({ version: 0, completed: ['x'] })
    expect(new KeyValueProgressStore(fakeStorage({ 'pattern-circuit:progress': old })).load()).toEqual(emptyProgress())
  })

  it('failing storage does not break the game', () => {
    const store = new KeyValueProgressStore({
      getItem: () => {
        throw new Error('bloqueado')
      },
      setItem: () => {
        throw new Error('lleno')
      },
    })
    expect(store.load()).toEqual(emptyProgress())
    expect(() => store.save(emptyProgress())).not.toThrow()
  })
})

describe('progress: helpers', () => {
  it('parseNoteKey is the inverse of noteKey', () => {
    expect(parseNoteKey(noteKey('L10-observer', 'chain-of-responsibility'))).toEqual({ levelId: 'L10-observer', pattern: 'chain-of-responsibility' })
  })

  it('withNotes records each pattern only once', () => {
    const p = withNotes(withNotes(emptyProgress(), 'L1', ['strategy', 'observer']), 'L1', ['strategy'])
    expect(p.notes).toEqual(['L1:strategy', 'L1:observer'])
  })

  it('firstUnfinished starts at the first uncompleted level, or at the first if everything is done', () => {
    const levels = [{ id: 'a' }, { id: 'b' }]
    expect(firstUnfinished(levels, emptyProgress()).id).toBe('a')
    expect(firstUnfinished(levels, { ...emptyProgress(), completed: ['a'] }).id).toBe('b')
    expect(firstUnfinished(levels, { ...emptyProgress(), completed: ['b', 'a'] }).id).toBe('a')
  })
})

describe('progress: compatibility and predictions', () => {
  it('progress saved by 1.0 (without predictions) still loads', () => {
    const storage = fakeStorage({ 'pattern-circuit:progress': JSON.stringify({ version: 1, completed: ['L00-tutorial'], notes: [] }) })
    expect(new KeyValueProgressStore(storage).load()).toEqual({ ...emptyProgress(), completed: ['tutorial'] })
  })

  it('withPrediction counts hits over the total', () => {
    const p = withPrediction(withPrediction(emptyProgress(), true), false)
    expect(p.predictions).toEqual({ right: 1, total: 2 })
  })
})

describe('progress: renamed ids', () => {
  it('the final level of 1.0 (L24) is recognized by its current id', () => {
    const storage = fakeStorage({ 'pattern-circuit:progress': JSON.stringify({ version: 1, completed: ['L01-strategy', 'L24-cafeteria-completa'], notes: [] }) })
    expect(new KeyValueProgressStore(storage).load().completed).toEqual(['strategy', 'full-cafe'])
  })

  it('progress from 1.1 (numbered ids) still loads with the current ids', () => {
    const saved = { version: 1, completed: ['L00-tutorial', 'L15-sucursales-y-pagos', 'L26-cafeteria-completa'], notes: ['L17-pedidos-en-vivo:state'], predictions: { right: 1, total: 2 }, review: {} }
    const p = new KeyValueProgressStore(fakeStorage({ 'pattern-circuit:progress': JSON.stringify(saved) })).load()
    expect(p.completed).toEqual(['tutorial', 'branches-and-payments', 'full-cafe'])
    expect(p.notes).toEqual(['live-orders:state'])
    expect(p.predictions).toEqual({ right: 1, total: 2 })
  })

  it('also translates notes and review cards', () => {
    const p = migrateLevelIds({ ...emptyProgress(), notes: ['L24-cafeteria-completa:strategy'], review: { 'L24-cafeteria-completa/x': { box: 2, due: 0 } } })
    expect(p.notes).toEqual(['full-cafe:strategy'])
    expect(Object.keys(p.review)).toEqual(['full-cafe/x'])
  })

  it('current ids are left alone (migrating twice gives the same result)', () => {
    const once = migrateLevelIds({ ...emptyProgress(), completed: ['L01-strategy'], notes: ['L01-strategy:strategy'] })
    expect(migrateLevelIds(once)).toEqual(once)
  })

  it('every old id points to an existing level and every numbered level has its translation', () => {
    const current = new Set(LEVELS.map((l) => l.id))
    expect(Object.values(LEGACY_LEVEL_IDS).every((id) => current.has(id))).toBe(true)
    expect(LEVELS.filter((l) => !Object.values(LEGACY_LEVEL_IDS).includes(l.id)).map((l) => l.id)).toEqual([])
  })

  it('review cards saved with the old socket id are still valid', () => {
    const p = migrateLevelIds({ ...emptyProgress(), review: { 'L01-strategy/metodo-de-pago': { box: 3, due: 7 }, 'L15-sucursales-y-pagos/crear-bebida': { box: 1, due: 0 } } })
    expect(p.review).toEqual({ 'strategy/payment-method': { box: 3, due: 7 }, 'branches-and-payments/create-drink': { box: 1, due: 0 } })
  })

  it('every old socket id points to an existing socket', () => {
    const current = new Set(LEVELS.flatMap((l) => l.sockets.map((s) => s.id)))
    expect(Object.values(LEGACY_SOCKET_IDS).filter((id) => !current.has(id))).toEqual([])
  })
})
