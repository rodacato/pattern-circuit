import { seenInFor, type CodeLang, type PatternId } from '../engine'
import { msg } from '../i18n'
import { useT } from './i18nContext'

const LANGUAGE_NAME: Record<CodeLang, string> = { rb: 'Ruby', ts: 'Ruby', py: 'Python' } // TypeScript shows the Ruby example

// "Where you have seen it": the pattern in real code of the language being read, with a link to the source.
export function SeenIn({ pattern, lang }: { pattern: PatternId; lang: CodeLang }) {
  const t = useT()
  const found = seenInFor(pattern, lang)
  if (!found) return null
  const { info } = found
  return (
    <p className="seen-in">
      <span className="label">📍 {t(msg('ui.seenIn.label', { language: LANGUAGE_NAME[found.lang], example: info.example }))}</span> {t(info.text)}{' '}
      <a href={info.url} target="_blank" rel="noopener noreferrer">
        {t('ui.seenIn.source')}
      </a>
    </p>
  )
}
