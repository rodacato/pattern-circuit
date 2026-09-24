import { useEffect, useRef, useState } from 'react'
import { resolveRegion } from '../../engine'
import { highlightRuby, plainTokens, type Token } from '../code/highlight'
import type { GameSession } from '../session'
import { useSession } from './useSession'

export function CodePanel({ session }: { session: GameSession }) {
  const fileName = useSession(session, (s) => s.codeFileName)
  const file = useSession(session, (s) => s.codeFile)
  const activeRef = useSession(session, (s) => s.activeRef)
  const followed = useSession(session, (s) => s.followed)
  const inspected = useSession(session, (s) => (s.inspected ? s.circuit.nodes.get(s.inspected)?.label : undefined))
  const [tokens, setTokens] = useState<Token[][]>(() => plainTokens(file.text))
  const body = useRef<HTMLDivElement>(null)
  const region = resolveRegion(file, activeRef)

  useEffect(() => {
    let alive = true
    setTokens(plainTokens(file.text))
    highlightRuby(file.text)
      .then((t) => alive && setTokens(t))
      .catch(() => {}) // sin resaltado, el código plano sigue siendo legible
    return () => {
      alive = false
    }
  }, [file.text])

  useEffect(() => {
    body.current?.querySelector('.line.on')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [region?.start, file.text])

  const source = followed !== undefined && activeRef ? `pulso #${followed}` : inspected ? `nodo · ${inspected}` : undefined

  return (
    <aside className="code-panel">
      <div className="code-head">
        <span className="file">{fileName}</span>
        {activeRef && (
          <span className="ref">
            {source && <em>{source}</em>}
            <code>{activeRef}</code>
          </span>
        )}
      </div>
      <div className="code-body" ref={body}>
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
    </aside>
  )
}
