// Idiomas. El español es el idioma fuente: cada texto se escribe en español en su lugar (niveles,
// catálogo, tarjetas) y los catálogos de otros idiomas lo traducen usando ese texto como clave.
// Lo que no tiene traducción se muestra en español: nunca queda un hueco.
export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]

// Un texto con huecos `{nombre}`; los valores también se traducen (p. ej. el nombre de un socket),
// y un valor puede ser otro mensaje con sus propios huecos.
export type Message = string | { text: string; params: Record<string, Param> }
type Param = string | number | Message

// Marca un texto para traducir sin cambiarlo (como N_ en gettext): así los tests lo encuentran.
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
