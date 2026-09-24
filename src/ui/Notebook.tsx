import { FAMILY_NAMES, PATTERNS, type Level, type PatternId, type SocketOption } from '../engine'
import { parseNoteKey } from '../game/progress/progress'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { SeenIn } from './SeenIn'
import { useDialog } from './useDialog'

type Entry = { level: Level; option: SocketOption }

// i18n
const OUTCOME_LABEL = {
  solves: 'Resuelve',
  partial: 'Parcial',
  misfit: 'No encaja',
} as const

// Una nota por cada socket del nivel donde se probó ese patrón (un patrón puede ofrecerse en varios).
function entriesFor(levels: Level[], notes: string[]): Map<PatternId, Entry[]> {
  const byPattern = new Map<PatternId, Entry[]>()
  for (const key of notes) {
    const { levelId, pattern } = parseNoteKey(key)
    const level = levels.find((l) => l.id === levelId)
    const options = level?.sockets.flatMap((s) => (s.options[pattern] ? [s.options[pattern]] : [])) ?? []
    const unique = options.filter((o, i) => options.findIndex((x) => x.note.title === o.note.title) === i)
    if (level && unique.length) byPattern.set(pattern, [...(byPattern.get(pattern) ?? []), ...unique.map((option) => ({ level, option }))])
  }
  return byPattern
}

// Cuaderno de patrones: cada patrón probado deja una nota, también los que no encajaban.
type Props = { levels: Level[]; notes: string[]; predictions?: { right: number; total: number }; onClose: () => void; onReset: () => void }

export function Notebook({ levels, notes, predictions, onClose, onReset }: Props) {
  const t = useT()
  const byPattern = entriesFor(levels, notes)
  const total = [...byPattern.values()].reduce((n, list) => n + list.length, 0)
  const closeButton = useDialog<HTMLButtonElement>(onClose)

  const reset = () => {
    if (window.confirm(t('¿Borrar todo el progreso? Se pierden los niveles completados y las notas del cuaderno.'))) onReset()
  }

  return (
    <div className="notebook-backdrop" onClick={onClose}>
      <aside className="notebook card" role="dialog" aria-modal="true" aria-labelledby="notebook-title" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">{t('Cuaderno de patrones')}</span>
            <h2 id="notebook-title">{t(msg('{n} notas de campo', { n: total }))}</h2>
            {!!predictions?.total && (
              <span className="muted">
                🔮 {t(msg('Predicciones acertadas: {right} de {total}', { right: predictions.right, total: predictions.total }))}
              </span>
            )}
          </div>
          <button ref={closeButton} className="close" onClick={onClose} aria-label={t('Cerrar cuaderno')}>
            ×
          </button>
        </header>
        {total === 0 && <p className="muted">{t('Todavía vacío. Cada patrón que pruebes en un socket deja aquí lo que aprendiste.')}</p>}
        {[...byPattern].map(([pattern, list]) => (
          <section key={pattern} className={`note-group ${PATTERNS[pattern].family}`}>
            <h3>
              <span className="stripe" />
              {t(PATTERNS[pattern].name)} <small>{t(FAMILY_NAMES[PATTERNS[pattern].family])}</small>
            </h3>
            <p className="gist">{t(PATTERNS[pattern].gist)}</p>
            <SeenIn info={PATTERNS[pattern].seenIn} />
            {list.map(({ level, option }) => (
              <article key={`${level.id}:${option.note.title}`} className={`note ${option.outcome}`}>
                <span className="where">
                  {t(msg('Nivel {n} · {title}', { n: level.order, title: level.title }))} · <b>{t(OUTCOME_LABEL[option.outcome])}</b>
                </span>
                <strong>{t(option.note.title)}</strong>
                <p>{t(option.note.body)}</p>
              </article>
            ))}
          </section>
        ))}
        <footer className="notebook-foot">
          <button className="link danger" onClick={reset}>
            {t('Borrar progreso')}
          </button>
        </footer>
      </aside>
    </div>
  )
}
