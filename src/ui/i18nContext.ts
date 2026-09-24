import { createContext, useContext } from 'react'
import { identity, type Locale, type Translate } from '../i18n'

export type I18nValue = { locale: Locale; t: Translate; setLocale: (l: Locale) => void }

export const I18nContext = createContext<I18nValue>({ locale: 'es', t: identity, setLocale: () => {} })

export const useT = () => useContext(I18nContext).t
export const useLocale = () => useContext(I18nContext)
