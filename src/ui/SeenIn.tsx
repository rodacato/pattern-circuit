import type { SeenIn as SeenInInfo } from '../engine'
import { msg } from '../i18n'
import { useT } from './i18nContext'

// "Dónde lo has visto": el patrón en código Ruby real, con enlace a la fuente.
export function SeenIn({ info }: { info?: SeenInInfo }) {
  const t = useT()
  if (!info) return null
  return (
    <p className="seen-in">
      <span className="label">📍 {t(msg('En Ruby: {example}.', { example: info.example }))}</span> {t(info.text)}{' '}
      <a href={info.url} target="_blank" rel="noopener noreferrer">
        {t('Ver fuente ↗')}
      </a>
    </p>
  )
}
