import { describe, expect, it } from 'vitest'
import { emptyProgress, KeyValueProgressStore, noteKey, withCompleted, withNote } from './progress'

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
}

describe('progreso', () => {
  it('marcar completado y anotar notas es idempotente', () => {
    const p = withNote(withCompleted(withCompleted(emptyProgress(), 'L1'), 'L1'), noteKey('L1', 'observer'))
    expect(withNote(p, 'L1:observer')).toBe(p)
    expect(p).toEqual({ version: 1, completed: ['L1'], notes: ['L1:observer'] })
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
