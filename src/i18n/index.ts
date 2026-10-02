// Languages. Spanish is the source language: each text is written in Spanish in place (levels,
// catalog, cards) and the catalogs of other languages translate it using that text as the key.
// What has no translation is shown in Spanish: there is never a gap.
export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

// A text with `{name}` placeholders; the values are translated too (e.g. a socket name),
// and a value can be another message with its own placeholders.
export type Message = string | { text: string; params: Record<string, Param> }
type Param = string | number | Message

// Marks a text for translation without changing it (like N_ in gettext): that way the tests find it.
export const N = (text: string) => text

export const msg = (text: string, params: Record<string, Param>): Message => ({ text, params })

export type Catalog = Record<string, string>
export type Translate = (m: Message) => string

export function createTranslator(catalog: Catalog): Translate {
  const one = (text: string) => (text ? (catalog[text] ?? text) : text)
  const translate: Translate = (m) => {
    if (typeof m === 'string') return one(m)
    return one(m.text).replace(/\{(\w+)\}/g, (hole, name: string) => {
      const value = m.params[name]
      return value === undefined ? hole : typeof value === 'number' ? String(value) : translate(value)
    })
  }
  return translate
}

export const identity: Translate = createTranslator({})

export function detectLocale(stored: string | null, languages: readonly string[]): Locale {
  if (stored === 'es' || stored === 'en') return stored
  return languages.some((l) => l.toLowerCase().startsWith('es')) || !languages.length ? 'es' : 'en'
}
