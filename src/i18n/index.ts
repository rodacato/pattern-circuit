// Spoken languages. Every visible text is identified by a key (`ui.notebook.title`) and lives in a catalog file
// per locale under `locales/<code>/`; no component, render or level contains prose. English is the canonical
// locale: its catalogs define the typed keys and every other locale must provide the same ones.
// A missing translation falls back to the canonical locale, and as a last resort shows the key itself.
import type { AppKey } from './keys'

export type Locale = string

// Text with holes `{name}`. The values are translated too (a socket name, for example) and may be other messages.
export type Message = string | { key: string; params: Params }
export type Params = Record<string, string | number | Message>

export type Catalog = Record<string, string>
export type Translate = (m: Message) => string

// Builds a message with holes: msg('ui.header.level', { n: 3 }).
export const msg = (key: AppKey, params: Params): Message => ({ key, params })

// Marks a key for translation without translating it yet (like N_ in gettext), for texts that are chosen in
// one place and shown in another (engine and game return keys; ui and render translate them).
export const N = <K extends AppKey>(key: K): K => key

// Level texts live in `levels.<levelId>.<path>`; whatever a level does not define itself falls back to
// `levels.shared.<path>` (the common vocabulary: customer, charge, …).
const sharedKey = (key: string) => key.replace(/^levels\.[^.]+\./, 'levels.shared.')

// `catalogs` go from the most specific (the player's locale) to the least (the canonical locale).
export function createTranslator(catalogs: readonly Catalog[]): Translate {
  const lookup = (key: string): string => {
    for (const catalog of catalogs) {
      const found = catalog[key] ?? (key.startsWith('levels.') ? catalog[sharedKey(key)] : undefined)
      if (found !== undefined) return found
    }
    return key
  }
  const translate: Translate = (m) => {
    if (typeof m === 'string') return m ? lookup(m) : m
    return lookup(m.key).replace(/\{(\w+)\}/g, (hole, name: string) => {
      const value = m.params[name]
      return value === undefined ? hole : typeof value === 'number' ? String(value) : translate(value)
    })
  }
  return translate
}

export const identity: Translate = createTranslator([])
