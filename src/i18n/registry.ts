// The folders under `locales/` are the registry: a new language is a new folder, with no code change.
import type { Catalog, Locale } from '.'

export type LocaleMeta = { name: string; short: string }

const metas = import.meta.glob<{ default: LocaleMeta }>('./locales/*/meta.ts', { eager: true })
const catalogs = import.meta.glob<{ default: Catalog }>('./locales/*/index.ts', { eager: true })

const codeOf = (path: string) => path.split('/')[2]

// English defines the typed keys; every other locale must provide the same ones.
export const CANONICAL_LOCALE: Locale = 'en'
export const PREFERRED_LOCALE: Locale = 'es-MX'

export const LOCALE_META: Record<Locale, LocaleMeta> = Object.fromEntries(Object.entries(metas).map(([path, m]) => [codeOf(path), m.default]))
export const LOCALES: Locale[] = Object.keys(LOCALE_META).sort((a, b) => (a === PREFERRED_LOCALE ? -1 : b === PREFERRED_LOCALE ? 1 : a.localeCompare(b)))
export const APP_CATALOGS: Record<Locale, Catalog> = Object.fromEntries(Object.entries(catalogs).map(([path, m]) => [codeOf(path), m.default]))

export const isLocale = (candidate: string): candidate is Locale => candidate in LOCALE_META

const language = (tag: string) => tag.split('-')[0]?.toLowerCase()

// The exact tag, or another variant of the same language (`es`, `es-AR` → `es-MX`).
export function matchLocale(tag: string): Locale | undefined {
  if (isLocale(tag)) return tag
  return LOCALES.find((l) => language(l) === language(tag))
}

// A saved choice wins; Spanish wins if the browser lists it anywhere; then the first language the game speaks.
export function detectLocale(stored: string | null, languages: readonly string[]): Locale {
  const saved = stored ? matchLocale(stored) : undefined
  if (saved) return saved
  if (!languages.length || languages.some((l) => language(l) === language(PREFERRED_LOCALE))) return PREFERRED_LOCALE
  return languages.map(matchLocale).find((l) => l !== undefined) ?? CANONICAL_LOCALE
}

export const nextLocale = (current: Locale): Locale => LOCALES[(LOCALES.indexOf(current) + 1) % LOCALES.length] ?? current
