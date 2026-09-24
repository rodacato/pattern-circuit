import { describe, expect, it } from 'vitest'
import { emptyProgress, firstUnfinished, KeyValueProgressStore, migrateLevelIds, noteKey, parseNoteKey, withCompleted, withNote, withNotes, withPrediction } from './progress'

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
}

describe('progreso', () => {
  it('marcar completado y anotar notas es idempotente', () => {
    const p = withNote(withCompleted(withCompleted(emptyProgress(), 'L1'), 'L1'), noteKey('L1', 'observer'))
    expect(withNote(p, 'L1:observer')).toBe(p)
    expect(p).toMatchObject({ version: 1, completed: ['L1'], notes: ['L1:observer'] })
  })

  it('guarda y recupera del almacenamiento', () => {
    const storage = fakeStorage()
    const store = new KeyValueProgressStore(storage)
    store.save(withCompleted(emptyProgress(), 'L0'))
    expect(new KeyValueProgressStore(storage).load().completed).toEqual(['L0'])
  })

  it('datos corruptos o de otra versión empiezan de cero', () => {
    expect(new KeyValueProgressStore(fakeStorage({ 'pattern-circuit:progress': '{roto' })).load()).toEqual(emptyProgress())
    const old = JSON.stringify({ version: 0, completed: ['x'] })
    expect(new KeyValueProgressStore(fakeStorage({ 'pattern-circuit:progress': old })).load()).toEqual(emptyProgress())
  })

  it('un almacenamiento que falla no rompe el juego', () => {
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

describe('progreso: ayudantes', () => {
  it('parseNoteKey es el inverso de noteKey', () => {
    expect(parseNoteKey(noteKey('L10-observer', 'chain-of-responsibility'))).toEqual({ levelId: 'L10-observer', pattern: 'chain-of-responsibility' })
  })

  it('withNotes anota cada patrón una sola vez', () => {
    const p = withNotes(withNotes(emptyProgress(), 'L1', ['strategy', 'observer']), 'L1', ['strategy'])
    expect(p.notes).toEqual(['L1:strategy', 'L1:observer'])
  })

  it('firstUnfinished arranca en el primer nivel sin completar, o en el primero si ya se terminó todo', () => {
    const levels = [{ id: 'a' }, { id: 'b' }]
    expect(firstUnfinished(levels, emptyProgress()).id).toBe('a')
    expect(firstUnfinished(levels, { ...emptyProgress(), completed: ['a'] }).id).toBe('b')
    expect(firstUnfinished(levels, { ...emptyProgress(), completed: ['b', 'a'] }).id).toBe('a')
  })
})

describe('progreso: compatibilidad y predicciones', () => {
  it('el progreso guardado por 1.0 (sin predicciones) sigue cargando', () => {
    const storage = fakeStorage({ 'pattern-circuit:progress': JSON.stringify({ version: 1, completed: ['L00-tutorial'], notes: [] }) })
    expect(new KeyValueProgressStore(storage).load()).toEqual({ ...emptyProgress(), completed: ['L00-tutorial'] })
  })

  it('withPrediction cuenta aciertos sobre el total', () => {
    const p = withPrediction(withPrediction(emptyProgress(), true), false)
    expect(p.predictions).toEqual({ right: 1, total: 2 })
  })
})

describe('progreso: ids renombrados', () => {
  it('el nivel final de 1.0 (L24) se reconoce como L26', () => {
    const storage = fakeStorage({ 'pattern-circuit:progress': JSON.stringify({ version: 1, completed: ['L01-strategy', 'L24-cafeteria-completa'], notes: [] }) })
    expect(new KeyValueProgressStore(storage).load().completed).toEqual(['L01-strategy', 'L26-cafeteria-completa'])
  })

  it('traduce también notas y tarjetas de repaso', () => {
    const p = migrateLevelIds({ ...emptyProgress(), notes: ['L24-cafeteria-completa:strategy'], review: { 'L24-cafeteria-completa/x': { box: 2, due: 0 } } })
    expect(p.notes).toEqual(['L26-cafeteria-completa:strategy'])
    expect(Object.keys(p.review)).toEqual(['L26-cafeteria-completa/x'])
  })
})
