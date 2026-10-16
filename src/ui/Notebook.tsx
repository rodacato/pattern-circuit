import { useState } from 'react'
import { FAMILY_NAMES, PATTERNS, type CodeLang, type Level, type PatternId, type SocketOption } from '../engine'
import { parseNoteKey } from '../game/progress/progress'
import { msg, N } from '../i18n'
import { useT } from './i18nContext'
import { SeenIn } from './SeenIn'
import { useDialog } from './useDialog'

type Entry = { level: Level; option: SocketOption }

const OUTCOME_LABEL = {
  solves: N('ui.notebook.outcome.solves'),
  partial: N('ui.notebook.outcome.partial'),
  misfit: N('ui.notebook.outcome.misfit'),
} as const

// One note per level socket where that pattern was tried (a pattern can be offered in several).
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

// Pattern notebook: each pattern tried leaves a note, also the ones that did not fit.
// `lang` is the code language being read: the example of each pattern comes from that ecosystem when there is one.
type Props = { levels: Level[]; notes: string[]; predictions?: { right: number; total: number }; lang?: CodeLang; onClose: () => void; onReset: () => void }

export function Notebook({ levels, notes, predictions, lang = 'rb', onClose, onReset }: Props) {
  const t = useT()
  const byPattern = entriesFor(levels, notes)
  const total = [...byPattern.values()].reduce((n, list) => n + list.length, 0)
  const closeButton = useDialog<HTMLButtonElement>(onClose)

  // A native confirm() is blocked inside a sandboxed iframe, so the question is part of the dialog.
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="notebook-backdrop" onClick={onClose}>
      <aside className="notebook card" role="dialog" aria-modal="true" aria-labelledby="notebook-title" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <span className="eyebrow">{t('ui.notebook.eyebrow')}</span>
            <h2 id="notebook-title">{t(msg('ui.notebook.title', { n: total }))}</h2>
            {!!predictions?.total && (
              <span className="muted">
                🔮 {t(msg('ui.notebook.predictions', { right: predictions.right, total: predictions.total }))}
              </span>
            )}
          </div>
          <button ref={closeButton} className="close" onClick={onClose} aria-label={t('ui.notebook.close')}>
            ×
          </button>
        </header>
        {total === 0 && <p className="muted">{t('ui.notebook.empty')}</p>}
        {[...byPattern].map(([pattern, list]) => (
          <section key={pattern} className={`note-group ${PATTERNS[pattern].family}`}>
            <h3>
              <span className="stripe" />
              {t(PATTERNS[pattern].name)} <small>{t(FAMILY_NAMES[PATTERNS[pattern].family])}</small>
            </h3>
            <p className="gist">{t(PATTERNS[pattern].gist)}</p>
            <SeenIn pattern={pattern} lang={lang} />
            {list.map(({ level, option }) => (
              <article key={`${level.id}:${option.note.title}`} className={`note ${option.outcome}`}>
                <span className="where">
                  {t(msg('ui.common.levelTitle', { n: level.order, title: level.title }))} · <b>{t(OUTCOME_LABEL[option.outcome])}</b>
                </span>
                <strong>{t(option.note.title)}</strong>
                <p>{t(option.note.body)}</p>
              </article>
            ))}
          </section>
        ))}
        <footer className="notebook-foot">
          {confirming ? (
            <div role="alert" className="confirm">
              <p>{t('ui.notebook.confirmReset')}</p>
              <button className="link danger" onClick={onReset}>
                {t('ui.notebook.resetYes')}
              </button>
              <button className="link" onClick={() => setConfirming(false)}>
                {t('ui.notebook.resetNo')}
              </button>
            </div>
          ) : (
            <button className="link danger" onClick={() => setConfirming(true)}>
              {t('ui.notebook.reset')}
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}
