import type { SeenIn as SeenInInfo } from '../engine'

// "Dónde lo has visto": el patrón en código Ruby real, con enlace a la fuente.
export function SeenIn({ info }: { info?: SeenInInfo }) {
  if (!info) return null
  return (
    <p className="seen-in">
      <span className="label">📍 En Ruby: {info.example}.</span> {info.text}{' '}
      <a href={info.url} target="_blank" rel="noopener noreferrer">
        Ver fuente ↗
      </a>
    </p>
  )
}
