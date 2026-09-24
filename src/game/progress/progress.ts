import { z } from 'zod'
import type { PatternId } from '../../engine'

// Puerto de persistencia: la sesión no sabe si el progreso vive en localStorage, en memoria o en un servidor.
export interface ProgressStore {
  load(): Progress
  save(progress: Progress): void
}

export const Progress = z.object({
  version: z.literal(1),
  completed: z.array(z.string()),
  notes: z.array(z.string()), // `${levelId}:${pattern}`
})
export type Progress = z.infer<typeof Progress>

export const emptyProgress = (): Progress => ({ version: 1, completed: [], notes: [] })

export const noteKey = (levelId: string, pattern: PatternId) => `${levelId}:${pattern}`

export function parseNoteKey(key: string): { levelId: string; pattern: PatternId } {
  const [levelId, pattern] = key.split(':') as [string, PatternId]
  return { levelId, pattern }
}

// Nivel con el que arranca el juego: el primero sin completar (o el primero, si ya se terminó todo).
export const firstUnfinished = <L extends { id: string }>(levels: L[], p: Progress): L => levels.find((l) => !p.completed.includes(l.id)) ?? levels[0]

export const withCompleted = (p: Progress, levelId: string): Progress =>
  p.completed.includes(levelId) ? p : { ...p, completed: [...p.completed, levelId] }

export const withNote = (p: Progress, key: string): Progress => (p.notes.includes(key) ? p : { ...p, notes: [...p.notes, key] })

export const withNotes = (p: Progress, levelId: string, patterns: PatternId[]): Progress => patterns.reduce((acc, pattern) => withNote(acc, noteKey(levelId, pattern)), p)

export class MemoryProgressStore implements ProgressStore {
  private value: Progress

  constructor(initial: Progress = emptyProgress()) {
    this.value = initial
  }

  load() {
    return this.value
  }

  save(progress: Progress) {
    this.value = progress
  }
}

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

// Datos corruptos o de otra versión no rompen el juego: se empieza de cero.
export class KeyValueProgressStore implements ProgressStore {
  private readonly storage: KeyValueStorage
  private readonly key: string

  constructor(storage: KeyValueStorage, key = 'pattern-circuit:progress') {
    this.storage = storage
    this.key = key
  }

  load(): Progress {
    try {
      const parsed = Progress.safeParse(JSON.parse(this.storage.getItem(this.key) ?? 'null'))
      return parsed.success ? parsed.data : emptyProgress()
    } catch {
      return emptyProgress()
    }
  }

  save(progress: Progress) {
    try {
      this.storage.setItem(this.key, JSON.stringify(progress))
    } catch {
      // almacenamiento lleno o bloqueado: el progreso sigue en memoria durante la sesión
    }
  }
}
