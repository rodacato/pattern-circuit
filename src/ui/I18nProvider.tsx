import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createTranslator, type Catalog, type Locale } from '../i18n'
import { APP_CATALOGS, CANONICAL_LOCALE, detectLocale } from '../i18n/registry'
import { LEVEL_CATALOGS } from '../levels'
import { I18nContext } from './i18nContext'

// From the player's locale down to the canonical one, so a missing translation shows English instead of a key.
const catalogsFor = (locale: Locale): Catalog[] =>
  [APP_CATALOGS[locale], LEVEL_CATALOGS[locale], APP_CATALOGS[CANONICAL_LOCALE], LEVEL_CATALOGS[CANONICAL_LOCALE]].filter((c): c is Catalog => c !== undefined)

// `locale` is where it starts; `onChange` lets the owner remember the player's choice.
export function I18nProvider({ children, locale: initial, onChange }: { children: ReactNode; locale?: Locale; onChange?: (locale: Locale) => void }) {
  const [locale, setLocaleState] = useState<Locale>(() => initial ?? detectLocale(null, navigator.languages ?? []))
  const remember = useRef(onChange)
  useEffect(() => {
    remember.current = onChange
  }, [onChange])
  const value = useMemo(() => {
    const setLocale = (l: Locale) => {
      setLocaleState(l)
      remember.current?.(l)
    }
    return { locale, t: createTranslator(catalogsFor(locale)), setLocale }
  }, [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
