import { KeyValueProgressStore, MemoryProgressStore, type KeyValueStorage, type ProgressStore } from '../game/progress/progress'

// Everything this course keeps in the browser when it runs standalone, in one place. Blocked or missing storage
// (private modes, a sandboxed iframe) never throws: the game just does not remember.
const KEYS = { locale: 'pattern-circuit:locale', codeLanguage: 'pattern-circuit:code' }

export type BrowserStorage = {
  progress: ProgressStore
  locale: { load(): string | null; save(value: string): void }
  codeLanguage: { load(): string | null; save(value: string): void }
}

function available(): KeyValueStorage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function createBrowserStorage(storage: KeyValueStorage | undefined = available()): BrowserStorage {
  const preference = (key: string) => ({
    load: () => {
      try {
        return storage?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    save: (value: string) => {
      try {
        storage?.setItem(key, value)
      } catch {
        // without storage the change lasts this session
      }
    },
  })
  return {
    progress: storage ? new KeyValueProgressStore(storage) : new MemoryProgressStore(),
    locale: preference(KEYS.locale),
    codeLanguage: preference(KEYS.codeLanguage),
  }
}
