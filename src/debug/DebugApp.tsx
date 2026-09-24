// Vista de depuración de la fase 1: muestra el motor tal cual, sin el lenguaje visual final.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildCircuit,
  codeKey,
  compile,
  createSim,
  evaluate,
  pointAt,
  resolveRegion,
  scenarioFor,
  solvesAll,
  Timeline,
  type Level,
  type PatternId,
  type Variant,
} from '../engine'
import { LEVELS } from '../levels'
import './debug.css'

const CELL = 64
const PAD = 60
const SPEEDS = [0.25, 0.5, 1, 2, 4]

export default function DebugApp() {
  const [levelId, setLevelId] = useState(LEVELS[0].id)
  const level = LEVELS.find((l) => l.id === levelId)!
  const [variant, setVariant] = useState<Variant>({})
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [, setFrame] = useState(0)
  const [activeRef, setActiveRef] = useState<string>()

  const { circuit, touched } = useMemo(() => buildCircuit(level, variant), [level, variant])
  const compiled = useMemo(() => compile(circuit), [circuit])
  const timeline = useMemo(() => new Timeline(createSim(circuit, scenarioFor(level, variant))), [circuit, level, variant])
  const evaluation = useMemo(() => evaluate(level, variant), [level, variant])
  const code = level.codeFiles.rb[codeKey(level, variant)]
  const region = resolveRegion(code, activeRef)

  const rerender = () => setFrame((f) => f + 1)
  const forward = () => {
    const ref = timeline.forward().findLast((e) => 'codeRef' in e && e.codeRef)
    if (ref && 'codeRef' in ref) setActiveRef(ref.codeRef)
  }

  const carry = useRef(0)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const loop = () => {
      carry.current += speed
      while (carry.current >= 1) {
        carry.current -= 1
        forward()
      }
      if (timeline.done) setPlaying(false)
      rerender()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  })

  const choose = (next: Variant) => {
    setVariant(next)
    setPlaying(false)
    setActiveRef(undefined)
  }

  const xs = circuit.nodes.map((n) => n.at[0])
  const ys = circuit.nodes.map((n) => n.at[1])
  const width = (Math.max(...xs) - Math.min(0, ...xs)) * CELL + PAD * 2
  const height = (Math.max(...ys) - Math.min(0, ...ys)) * CELL + PAD * 2
  const px = (v: number) => v * CELL + PAD
  const state = timeline.current.state

  return (
    <div className="debug">
      <header>
        <strong>Pattern Circuit · depuración del motor</strong>
        <select value={levelId} onChange={(e) => (setLevelId(e.target.value), choose({}))}>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.order}. {l.title}
            </option>
          ))}
        </select>
        <VariantControls level={level} variant={variant} onChange={choose} />
      </header>

      <main>
        <section className="stage">
          <p className="brief">{level.brief.problem}</p>
          <svg width={width} height={height}>
            {[...compiled.wires.values()].map((w) => (
              <polyline
                key={w.id}
                className={`wire ${w.dep}`}
                points={w.path.map((p) => `${px(p.x)},${px(p.y)}`).join(' ')}
              />
            ))}
            {circuit.nodes.map((n) => (
              <g key={n.id} transform={`translate(${px(n.at[0])},${px(n.at[1])})`} className={`node ${n.kind} ${touched.includes(n.id) ? 'touched' : ''}`}>
                <rect x={-44} y={-20} width={88} height={40} rx={8} />
                <text y={-2}>{n.label}</text>
                <text y={12} className="sub">
                  {n.behavior.type}
                  {state.load[n.id] ? ` · ${state.load[n.id]}` : ''}
                </text>
              </g>
            ))}
            {state.pulses
              .filter((p) => p.status === 'alive')
              .map((p) => {
                const pos =
                  p.loc.kind === 'wire'
                    ? pointAt(compiled.wires.get(p.loc.wireId)!.path, p.loc.progress)
                    : { x: compiled.nodes.get(p.loc.nodeId)!.at[0], y: compiled.nodes.get(p.loc.nodeId)!.at[1] - 0.55 }
                return (
                  <g key={p.id} transform={`translate(${px(pos.x)},${px(pos.y)})`}>
                    <circle r={7} className="pulse" />
                    <text y={-12} className="pulse-label">
                      {p.label}
                    </text>
                  </g>
                )
              })}
          </svg>

          <div className="transport">
            <button onClick={() => (timeline.back(), rerender())}>◀︎ paso</button>
            <button onClick={() => setPlaying(!playing)}>{playing ? 'pausa' : 'reproducir'}</button>
            <button onClick={() => (forward(), rerender())}>paso ▶︎</button>
            <button onClick={() => (timeline.reset(), setPlaying(false), setActiveRef(undefined), rerender())}>reiniciar</button>
            <span>
              velocidad
              {SPEEDS.map((s) => (
                <button key={s} className={s === speed ? 'on' : ''} onClick={() => setSpeed(s)}>
                  {s}×
                </button>
              ))}
            </span>
            <span className="tick">tick {timeline.tick}</span>
          </div>

          <table className="metrics">
            <tbody>
              {Object.entries(state.metrics).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
              <tr>
                <td>nodesTouched</td>
                <td>{touched.length ? `${touched.length} (${touched.join(', ')})` : 0}</td>
              </tr>
            </tbody>
          </table>
          <ul className="assertions">
            {evaluation.results.map((r, i) => (
              <li key={i} className={r.pass ? 'pass' : 'fail'}>
                {r.assertion.metric} {r.assertion.op} {r.assertion.value} → {r.actual}
              </li>
            ))}
            <li className={evaluation.won ? 'pass' : 'fail'}>{evaluation.won ? 'nivel resuelto' : 'aún no'}</li>
          </ul>
        </section>

        <aside className="code">
          <div className="code-head">
            {codeKey(level, variant)}.rb {activeRef && <em>· {activeRef}</em>}
          </div>
          <pre>
            {code.text.split('\n').map((l, i) => (
              <div key={i} className={region && i + 1 >= region.start && i + 1 <= region.end ? 'hl' : ''}>
                <span className="ln">{i + 1}</span>
                {l || ' '}
              </div>
            ))}
          </pre>
        </aside>
      </main>
    </div>
  )
}

function VariantControls({ level, variant, onChange }: { level: Level; variant: Variant; onChange: (v: Variant) => void }) {
  const plugs = variant.sockets ?? []
  // Un ticket solo corre sobre el circuito base o con todos los sockets resueltos.
  const ticketAllowed = plugs.length === 0 || solvesAll(level, variant)
  const setPlug = (socketId: string, pattern: PatternId | '') => {
    const others = plugs.filter((p) => p.id !== socketId)
    const sockets = pattern ? [...others, { id: socketId, pattern }] : others
    const next: Variant = { ...variant, sockets: sockets.length ? sockets : undefined }
    if (sockets.length && !solvesAll(level, next)) delete next.ticket
    onChange(next)
  }
  return (
    <>
      {level.repairs.map((r) => (
        <label key={r.id}>
          <input
            type="checkbox"
            checked={variant.repairs?.includes(r.id) ?? false}
            onChange={(e) =>
              onChange({
                ...variant,
                repairs: e.target.checked ? [...(variant.repairs ?? []), r.id] : variant.repairs?.filter((x) => x !== r.id),
              })
            }
          />
          {r.prompt}
        </label>
      ))}
      {level.sockets.map((socket) => (
        <select key={socket.id} value={plugs.find((p) => p.id === socket.id)?.pattern ?? ''} onChange={(e) => setPlug(socket.id, e.target.value as PatternId | '')}>
          <option value="">{socket.label}: sin patrón</option>
          {socket.inventory.map((p) => (
            <option key={p} value={p}>
              {p} ({socket.options[p]?.outcome})
            </option>
          ))}
        </select>
      ))}
      {level.changeTickets.map((t) => (
        <label key={t.id}>
          <input
            type="checkbox"
            disabled={!ticketAllowed}
            checked={variant.ticket === t.id}
            onChange={(e) => onChange({ ...variant, ticket: e.target.checked ? t.id : undefined })}
          />
          Ticket: {t.text}
        </label>
      ))}
    </>
  )
}
