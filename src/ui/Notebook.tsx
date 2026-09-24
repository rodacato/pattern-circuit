import { FAMILY_NAMES, PATTERNS, type Level, type PatternId } from '../engine'

type Entry = { level: Level; pattern: PatternId }

const OUTCOME_LABEL = { solves: 'Resuelve', partial: 'Parcial', misfit: 'No encaja' } as const

// Cuaderno de patrones: cada patrón probado deja una nota, también los que no encajaban.
export function Notebook({ levels, notes, onClose }: { levels: Level[]; notes: string[]; onClose: () => void }) {
  const entries: Entry[] = notes.flatMap((key) => {
    const [levelId, pattern] = key.split(':') as [string, PatternId]
    const level = levels.find((l) => l.id === levelId)
    return level ? [{ level, pattern }] : []
  })
  const byPattern = new Map<PatternId, Entry[]>()
  for (const e of entries) byPattern.set(e.pattern, [...(byPattern.get(e.pattern) ?? []), e])

  return (
    <div className="notebook-backdrop" onClick={onClose}>
      <aside className="notebook card" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">Cuaderno de patrones</span>
            <h2>{entries.length} notas de campo</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        {entries.length === 0 && <p className="muted">Todavía vacío. Cada patrón que pruebes en un socket deja aquí lo que aprendiste.</p>}
        {[...byPattern].map(([pattern, list]) => (
          <section key={pattern} className={`note-group ${PATTERNS[pattern].family}`}>
            <h3>
              <span className="stripe" />
              {PATTERNS[pattern].name} <small>{FAMILY_NAMES[PATTERNS[pattern].family]}</small>
            </h3>
            <p className="gist">{PATTERNS[pattern].gist}</p>
            {list.map(({ level }) => {
              const option = level.sockets.flatMap((s) => (s.options[pattern] ? [s.options[pattern]] : []))[0]
              if (!option) return null
              return (
                <article key={level.id} className={`note ${option.outcome}`}>
                  <span className="where">
                    Nivel {level.order} · {level.title} · <b>{OUTCOME_LABEL[option.outcome]}</b>
                  </span>
                  <strong>{option.note.title}</strong>
                  <p>{option.note.body}</p>
                </article>
              )
            })}
          </section>
        ))}
      </aside>
    </div>
  )
}
