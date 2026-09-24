import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createTranslator, detectLocale, type Catalog, type Locale } from '../i18n'
import { EN } from '../i18n/en'
import { LEVEL_CATALOGS } from '../levels'
import { I18nContext } from './i18nContext'

const KEY = 'pattern-circuit:locale'
const CATALOGS: Record<Locale, Catalog> = { es: {}, en: { ...EN, ...LEVEL_CATALOGS.en } }

// El idioma es una preferencia de este navegador: se guarda aparte del progreso.
function initialLocale(): Locale {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(KEY)
  } catch {
    // almacenamiento bloqueado: se usa el idioma del navegador
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
        // sin almacenamiento, el cambio dura esta sesión
      }
    }
    return { locale, t: createTranslator(CATALOGS[locale]), setLocale }
  }, [locale])
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
