import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createTranslator, type Catalog, type Locale } from '../i18n'
import { APP_CATALOGS, CANONICAL_LOCALE, detectLocale } from '../i18n/registry'
import { LEVEL_CATALOGS } from '../levels'
import { I18nContext } from './i18nContext'

const KEY = 'pattern-circuit:locale'

// From the player's locale down to the canonical one, so a missing translation shows English instead of a key.
const catalogsFor = (locale: Locale): Catalog[] =>
  [APP_CATALOGS[locale], LEVEL_CATALOGS[locale], APP_CATALOGS[CANONICAL_LOCALE], LEVEL_CATALOGS[CANONICAL_LOCALE]].filter((c): c is Catalog => c !== undefined)

// The language is a preference of this browser: it is saved apart from the progress.
function initialLocale(): Locale {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(KEY)
  } catch {
    // blocked storage: the browser's language is used
  }
  return detectLocale(stored, navigator.languages ?? [])
}

export function I18nProvider({ children, locale: fixed }: { children: ReactNode; locale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => fixed ?? initialLocale())
  const value = useMemo(() => {
    const setLocale = (l: Locale) => {
      setLocaleState(l)
      try {
        window.localStorage.setItem(KEY, l)
      } catch {
        // without storage, the change lasts this session
      }
    }
    return { locale, t: createTranslator(catalogsFor(locale)), setLocale }
  }, [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
