import { useEffect, useRef, useState } from 'react'
import { collapse, resolveRegion } from '../engine'
import { highlightRuby, plainTokens, type Token } from './code/highlight'
import type { GameSession } from '../game/session/GameSession'
import { prefersReducedMotion } from '../render/motion'
import { useSession } from './useSession'

export function CodePanel({ session }: { session: GameSession }) {
  const comparing = useSession(session, (s) => s.flow.stage === 'compare' || s.flow.stage === 'complete')
  const [view, setView] = useState<'code' | 'diff'>('code')
  const showDiff = comparing && view === 'diff'
  return (
    <aside className="code-panel">
      {comparing && (
        <div className="code-tabs" role="tablist" aria-label="Vista del código">
          <button role="tab" aria-selected={!showDiff} className={showDiff ? '' : 'on'} onClick={() => setView('code')}>
            Código
          </button>
          <button role="tab" aria-selected={showDiff} className={showDiff ? 'on' : ''} onClick={() => setView('diff')}>
            Cambios
          </button>
        </div>
      )}
      {showDiff ? <CodeDiff session={session} /> : <CodeView session={session} />}
    </aside>
  )
}

// Qué líneas de Ruby cambian entre sin y con patrón (o con el ticket), con el resto resumido.
function CodeDiff({ session }: { session: GameSession }) {
  useSession(session, (s) => s.flow.side) // re-render al cambiar de lado
  const change = session.codeChange
  if (!change) return null
  return (
    <>
      <div className="code-head">
        <span className="file">{change.title}</span>
        <span className="ref">
          <b className="add">+{change.added}</b> <b className="del">−{change.removed}</b>
        </span>
      </div>
      <div className="code-body diff" tabIndex={0} aria-label={`${change.title}: ${change.added} líneas agregadas, ${change.removed} quitadas`}>
        {collapse(change.lines).map((c, i) =>
          c.kind === 'skip' ? (
            <div key={i} className="line skip">
              <span className="ln">⋯</span>
              <span>{c.count} líneas sin cambios</span>
            </div>
          ) : (
            <div key={i} className={`line ${c.kind}`}>
              <span className="ln">{c.kind === 'add' ? '+' : c.kind === 'del' ? '−' : ' '}</span>
              <span>{c.text || ' '}</span>
            </div>
          ),
        )}
      </div>
      <div className="code-foot">Verde: líneas nuevas. Rojo: líneas que hubo que quitar o cambiar. Mira en qué clases caen.</div>
    </>
  )
}

function CodeView({ session }: { session: GameSession }) {
  const fileName = 'cafeteria.rb'
  const file = useSession(session, (s) => s.codeFile)
  const activeRef = useSession(session, (s) => s.playback.activeRef)
  const followed = useSession(session, (s) => s.playback.followed)
  const inspected = useSession(session, (s) => (s.playback.inspected ? s.playback.circuit.nodes.get(s.playback.inspected)?.label : undefined))
  const [highlighted, setHighlighted] = useState<{ text: string; tokens: Token[][] }>()
  const tokens = highlighted?.text === file.text ? highlighted.tokens : plainTokens(file.text)
  const body = useRef<HTMLDivElement>(null)
  const region = resolveRegion(file, activeRef)

  useEffect(() => {
    let alive = true
    highlightRuby(file.text)
      .then((t) => alive && setHighlighted({ text: file.text, tokens: t }))
      .catch(() => {}) // sin resaltado, el código plano sigue siendo legible
    return () => {
      alive = false
    }
  }, [file.text])

  useEffect(() => {
    body.current?.querySelector('.line.on')?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [region?.start, file.text])

  const source = followed !== undefined && activeRef ? `pulso #${followed}` : inspected ? `nodo · ${inspected}` : undefined

  return (
    <>
      <div className="code-head">
        <span className="file">{fileName}</span>
        {activeRef && (
          <span className="ref">
            {source && <em>{source}</em>}
            <code>{activeRef}</code>
          </span>
        )}
      </div>
      <div className="code-body" ref={body} tabIndex={0} aria-label="Código Ruby del circuito">
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
      <div className="code-foot">Haz clic en un nodo o en un pulso para seguir su código.</div>
    </>
  )
}
