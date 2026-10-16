import { z } from 'zod'
import type { PatternId } from '../../engine'

// Persistence port: the session does not know whether progress lives in localStorage, in memory or on a server.
export interface ProgressStore {
  load(): Progress
  save(progress: Progress): void
}

export const Progress = z.object({
  version: z.literal(1),
  completed: z.array(z.string()),
  notes: z.array(z.string()), // `${levelId}:${pattern}`
  // Fields added after 1.0: with a default, progress saved before stays valid.
  predictions: z.object({ right: z.number().int(), total: z.number().int() }).default({ right: 0, total: 0 }),
  review: z.record(z.string(), z.object({ box: z.number().int(), due: z.number() })).default({}), // card → Leitner box
})
export type Progress = z.infer<typeof Progress>

export const emptyProgress = (): Progress => ({ version: 1, completed: [], notes: [], predictions: { right: 0, total: 0 }, review: {} })

export const withPrediction = (p: Progress, right: boolean): Progress => ({
  ...p,
  predictions: { right: p.predictions.right + (right ? 1 : 0), total: p.predictions.total + 1 },
})

export const noteKey = (levelId: string, pattern: PatternId) => `${levelId}:${pattern}`

export function parseNoteKey(key: string): { levelId: string; pattern: PatternId } {
  const [levelId, pattern] = key.split(':') as [string, PatternId]
  return { levelId, pattern }
}

// Level the game starts on: the first uncompleted one (or the first, if everything is done).
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

// Level ids from earlier versions (1.0 and 1.1 numbered them: `L24-…`), mapped to the current ones.
// Saved progress is translated on load, so renaming a level never loses what a player completed.
export const LEGACY_LEVEL_IDS: Record<string, string> = {
  'L00-tutorial': 'tutorial',
  'L01-strategy': 'strategy',
  'L02-factory-method': 'factory-method',
  'L03-builder': 'builder',
  'L04-singleton': 'singleton',
  'L05-adapter': 'adapter',
  'L06-decorator': 'decorator',
  'L07-composite': 'composite',
  'L08-facade': 'facade',
  'L09-proxy': 'proxy',
  'L10-observer': 'observer',
  'L11-state': 'state',
  'L12-chain': 'chain',
  'L13-command': 'command',
  'L14-template-method': 'template-method',
  'L15-sucursales-y-pagos': 'branches-and-payments',
  'L16-combos-con-extras': 'combos-with-extras',
  'L17-pedidos-en-vivo': 'live-orders',
  'L18-ports-and-adapters': 'ports-and-adapters',
  'L19-event-bus': 'event-bus',
  'L20-cqrs': 'cqrs',
  'L21-null-object': 'null-object',
  'L22-circuit-breaker': 'circuit-breaker',
  'L23-saga': 'saga',
  'L24-un-solo-pago': 'single-payment',
  'L25-un-solo-oyente': 'single-listener',
  'L26-cafeteria-completa': 'full-cafe',
  'L24-cafeteria-completa': 'full-cafe',
}

// Socket ids from earlier versions: review cards are keyed `level/socket`, so they need the same translation.
export const LEGACY_SOCKET_IDS: Record<string, string> = {
  'aprobacion': 'approval',
  'aviso': 'notice',
  'avisos': 'notices',
  'cobro': 'charging',
  'contador': 'ticketCounter',
  'crear-bebida': 'create-drink',
  'crear-pedido': 'create-order',
  'dependencias': 'dependencies',
  'estados': 'states',
  'eventos': 'events',
  'inventario': 'inventory',
  'metodo-de-pago': 'payment-method',
  'modelo': 'model',
  'pasarela': 'gateway',
  'pasos': 'steps',
  'pedidos': 'orders',
  'proveedor': 'provider',
  'receta': 'recipe',
  'tarjeta': 'card',
  'cocina': 'kitchen',
}

export function migrateLevelIds(p: Progress): Progress {
  const id = (levelId: string) => LEGACY_LEVEL_IDS[levelId] ?? levelId
  const key = (k: string) => k.replace(/^[^:/]+/, (levelId) => id(levelId)) // `level:pattern` and `level/socket`
  const reviewKey = (k: string) => key(k).replace(/\/(.+)$/, (_, socket: string) => `/${LEGACY_SOCKET_IDS[socket] ?? socket}`)
  return {
    ...p,
    completed: p.completed.map(id),
    notes: p.notes.map(key),
    review: Object.fromEntries(Object.entries(p.review).map(([k, v]) => [reviewKey(k), v])),
  }
}

// Corrupt data or data from another version does not break the game: it starts from scratch.
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
      return parsed.success ? migrateLevelIds(parsed.data) : emptyProgress()
    } catch {
      return emptyProgress()
    }
  }

  save(progress: Progress) {
    try {
      this.storage.setItem(this.key, JSON.stringify(progress))
    } catch {
      // storage full or blocked: progress stays in memory for the session
    }
  }
}
