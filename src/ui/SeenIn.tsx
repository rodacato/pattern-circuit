import type { SeenIn as SeenInInfo } from '../engine'
import { msg } from '../i18n'
import { useT } from './i18nContext'

// "Where you have seen it": the pattern in real Ruby code, with a link to the source.
export function SeenIn({ info }: { info?: SeenInInfo }) {
  const t = useT()
  if (!info) return null
  return (
    <p className="seen-in">
      <span className="label">📍 {t(msg('ui.seenIn.label', { example: info.example }))}</span> {t(info.text)}{' '}
      <a href={info.url} target="_blank" rel="noopener noreferrer">
        {t('ui.seenIn.source')}
      </a>
    </p>
  )
}
