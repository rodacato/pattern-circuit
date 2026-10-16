import type { CodeLang } from '../engine'

// The ids the hub speaks (the ones its code runner uses) for the languages of the code panel.
const HOST_ID: Record<CodeLang, string> = { rb: 'ruby', ts: 'typescript' }

export const toHostLanguage = (lang: CodeLang): string => HOST_ID[lang]

export const fromHostLanguage = (id: string | undefined): CodeLang | undefined => (Object.keys(HOST_ID) as CodeLang[]).find((l) => HOST_ID[l] === id)

export const HOST_LANGUAGES: string[] = Object.values(HOST_ID)
