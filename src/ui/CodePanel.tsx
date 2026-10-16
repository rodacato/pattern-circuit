import { useEffect, useRef, useState } from 'react'
import { collapse, regionLabel, resolveRegion, type CodeLang } from '../engine'
import { highlight, plainTokens, type Mode, type Token } from './code/highlight'
import { useMode } from './themeContext'
import type { GameSession } from '../game/session/GameSession'
import { prefersReducedMotion } from '../render/motion'
import { msg } from '../i18n'
import { useT } from './i18nContext'
import { useSession } from './useSession'

export function CodePanel({ session }: { session: GameSession }) {
  const t = useT()
  const comparing = useSession(session, (s) => s.flow.stage === 'compare' || s.flow.stage === 'complete')
  const [view, setView] = useState<'code' | 'diff'>('code')
  const showDiff = comparing && view === 'diff'
  return (
    <aside className="code-panel">
      {comparing && (
        <div className="code-tabs" role="tablist" aria-label={t('ui.code.view')}>
          <button role="tab" aria-selected={!showDiff} className={showDiff ? '' : 'on'} onClick={() => setView('code')}>
            {t('ui.code.tabCode')}
          </button>
          <button role="tab" aria-selected={showDiff} className={showDiff ? 'on' : ''} onClick={() => setView('diff')}>
            {t('ui.code.tabChanges')}
          </button>
        </div>
      )}
      {showDiff ? <CodeDiff session={session} /> : <CodeView session={session} />}
    </aside>
  )
}

// Which Ruby lines change between without and with pattern (or with the ticket), with the rest summarized.
function CodeDiff({ session }: { session: GameSession }) {
  const t = useT()
  useSession(session, (s) => s.flow.side) // re-render when the side changes
  const change = session.codeChange
  if (!change) return null
  return (
    <>
      <div className="code-head">
        <span className="file">{t(change.title)}</span>
        <span className="ref">
          <b className="add">+{change.added}</b> <b className="del">−{change.removed}</b>
        </span>
      </div>
      <div className="code-body diff" tabIndex={0} aria-label={t(msg('ui.code.diffLabel', { title: t(change.title), added: change.added, removed: change.removed }))}>
        {collapse(change.lines).map((c, i) =>
          c.kind === 'skip' ? (
            <div key={i} className="line skip">
              <span className="ln">⋯</span>
              <span>{t(msg('ui.code.unchanged', { count: c.count }))}</span>
            </div>
          ) : (
            <div key={i} className={`line ${c.kind}`}>
              <span className="ln">{c.kind === 'add' ? '+' : c.kind === 'del' ? '−' : ' '}</span>
              <span>{c.text || ' '}</span>
            </div>
          ),
        )}
      </div>
      <div className="code-foot">{t('ui.code.diffFoot')}</div>
    </>
  )
}

function CodeView({ session }: { session: GameSession }) {
  const t = useT()
  const lang = useSession(session, (s) => s.shownCodeLang)
  const fileName = `cafeteria.${lang}`
  const file = useSession(session, (s) => s.codeFile)
  const activeRef = useSession(session, (s) => s.playback.activeRef)
  const followed = useSession(session, (s) => s.playback.followed)
  const inspected = useSession(session, (s) => (s.playback.inspected ? s.playback.circuit.nodes.get(s.playback.inspected)?.label : undefined))
  const mode = useMode()
  const [highlighted, setHighlighted] = useState<{ text: string; mode: Mode; tokens: Token[][] }>()
  const tokens = highlighted?.text === file.text && highlighted.mode === mode ? highlighted.tokens : plainTokens(file.text)
  const body = useRef<HTMLDivElement>(null)
  const region = resolveRegion(file, activeRef)

  useEffect(() => {
    let alive = true
    highlight(file.text, lang, mode)
      .then((t) => alive && setHighlighted({ text: file.text, mode, tokens: t }))
      .catch(() => {}) // without highlighting, the plain code is still readable
    return () => {
      alive = false
    }
  }, [file.text, lang, mode])

  useEffect(() => {
    body.current?.querySelector('.line.on')?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [region?.start, file.text])

  const source = followed !== undefined && activeRef ? t(msg('ui.code.pulse', { id: followed })) : inspected ? t(msg('ui.code.node', { label: inspected })) : undefined

  return (
    <>
      <div className="code-head">
        <span className="file">{fileName}</span>
        <LangSwitch session={session} />
        {activeRef && (
          <span className="ref">
            {source && <em>{source}</em>}
            <code>{regionLabel(activeRef, lang)}</code>
          </span>
        )}
      </div>
      <div className="code-body" ref={body} tabIndex={0} aria-label={t(CODE_LABEL[lang])}>
        {tokens.map((line, i) => {
          const on = !!region && i + 1 >= region.start && i + 1 <= region.end
          return (
            <div key={i} className={`line${on ? ' on' : ''}${region && !on ? ' dim' : ''}`}>
              <span className="ln">{i + 1}</span>
              <span>
                {line.length === 0 || (line.length === 1 && line[0].content === '')
                  ? ' '
                  : line.map((t, j) => (
                      <span key={j} style={{ color: t.color }}>
                        {t.content}
                      </span>
                    ))}
              </span>
            </div>
          )
        })}
      </div>
      <div className="code-foot">{t('ui.code.footHint')}</div>
    </>
  )
}

const LANG_NAME: Record<CodeLang, string> = { rb: 'Ruby', ts: 'TypeScript', py: 'Python' }
const CODE_LABEL = { rb: 'ui.code.labelRuby', ts: 'ui.code.labelTypeScript', py: 'ui.code.labelPython' } as const

// The same circuit told in another language: GameApp stores the preference for the following levels.
function LangSwitch({ session }: { session: GameSession }) {
  const t = useT()
  const shown = useSession(session, (s) => s.shownCodeLang)
  const langs = session.availableCodeLangs
  if (langs.length < 2) return null
  return (
    <span className="lang-switch" role="group" aria-label={t('ui.code.language')}>
      {langs.map((lang) => (
        <button key={lang} className={lang === shown ? 'on' : ''} aria-pressed={lang === shown} onClick={() => session.setCodeLang(lang)}>
          {LANG_NAME[lang]}
        </button>
      ))}
    </span>
  )
}

