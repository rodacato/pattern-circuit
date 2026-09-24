import {
  buildCircuit,
  codeKey,
  compile,
  createSim,
  evaluate,
  scenarioFor,
  Timeline,
  type CompiledCircuit,
  type Evaluation,
  type Level,
  type PlayerAction,
  type SimEvent,
  type SimState,
  type Variant,
} from '../engine'

export type SessionStatus = 'ready' | 'running' | 'done'
export type ConnectResult = 'repaired' | 'wrong' | 'none'

export const SPEEDS = [0.5, 1, 2, 4] as const

// Estado de una partida: une motor, reproducción y lo que el jugador ha hecho. Sin nada de Pixi ni React.
export class GameSession {
  readonly level: Level
  variant: Variant = {}
  circuit!: CompiledCircuit
  circuitVersion = 0
  touched: string[] = []
  timeline!: Timeline
  prevState!: SimState
  alpha = 0 // fracción entre prevState y el estado actual, para interpolar
  status: SessionStatus = 'ready'
  playing = false
  speed: number = 1
  followed?: number
  inspected?: string
  result?: Evaluation
  failedRuns = 0
  readonly actions = new Set<PlayerAction>()

  private carry = 0
  private pending: SimEvent[] = []
  private pulseRefs = new Map<number, string>()
  private listeners = new Set<() => void>()

  constructor(level: Level) {
    this.level = level
    this.rebuild()
  }

  get codeFile() {
    return this.level.codeFiles[codeKey(this.level, this.variant)]
  }

  get codeFileName() {
    return 'cafeteria.rb'
  }

  // Región activa: la del pulso seguido; si no hay, la del nodo inspeccionado.
  get activeRef(): string | undefined {
    if (this.followed !== undefined && this.pulseRefs.has(this.followed)) return this.pulseRefs.get(this.followed)
    return this.inspected ? this.circuit.nodes.get(this.inspected)?.codeRef : undefined
  }

  get pendingRepairs() {
    return this.level.repairs.filter((r) => !this.variant.repairs?.includes(r.id))
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  // Llamado por el render en cada frame; `deltaFrames` viene del ticker (1 ≈ 1/60 s).
  update(deltaFrames: number) {
    if (!this.playing) return
    this.carry += deltaFrames * this.speed
    let advanced = 0
    while (this.carry >= 1 && !this.timeline.done) {
      this.carry -= 1
      this.forward()
      advanced++
    }
    this.alpha = this.timeline.done ? 1 : Math.min(this.carry, 1)
    if (this.timeline.done) this.finish()
    if (advanced) this.emit()
  }

  drainEvents(): SimEvent[] {
    const events = this.pending
    this.pending = []
    return events
  }

  play() {
    if (this.timeline.done) this.restart()
    this.playing = true
    this.status = 'running'
    this.did('play')
  }

  pause() {
    this.playing = false
    this.did('pause')
  }

  toggle() {
    if (this.playing) this.pause()
    else this.play()
  }

  step() {
    this.playing = false
    this.status = 'running'
    if (!this.timeline.done) this.forward()
    this.alpha = 1
    if (this.timeline.done) this.finish()
    this.did('step')
  }

  back() {
    this.playing = false
    this.timeline.back()
    this.prevState = this.timeline.current.state
    this.alpha = 1
    if (!this.timeline.done && this.status === 'done') this.status = 'running'
    this.did('back')
  }

  restart() {
    this.timeline.reset()
    this.prevState = this.timeline.current.state
    this.pulseRefs.clear()
    this.followed = undefined
    this.status = 'ready'
    this.result = undefined
    this.carry = 0
    this.alpha = 1
  }

  reset() {
    this.playing = false
    this.restart()
    this.did('reset')
  }

  setSpeed(speed: number) {
    this.speed = speed
    this.did('speed')
  }

  inspect(nodeId: string | undefined) {
    this.inspected = nodeId
    this.followed = undefined
    this.did('inspect-node')
  }

  follow(pulseId: number) {
    this.followed = pulseId
    this.inspected = undefined
    this.did('follow-pulse')
  }

  // Arrastrar un cable: si coincide con una reparación pendiente, se aplica y la partida se reinicia sola.
  connect(from: string, to: string): ConnectResult {
    if (from === to) return 'none'
    const repair = this.pendingRepairs.find((r) => r.patch.add?.wires?.some((w) => w.from === from && w.to === to))
    if (!repair) return 'wrong'
    this.variant = { ...this.variant, repairs: [...(this.variant.repairs ?? []), repair.id] }
    this.rebuild()
    this.did('repair')
    this.play()
    return 'repaired'
  }

  private rebuild() {
    const built = buildCircuit(this.level, this.variant)
    this.circuit = compile(built.circuit)
    this.touched = built.touched
    this.circuitVersion++
    this.timeline = new Timeline(createSim(built.circuit, scenarioFor(this.level, this.variant)))
    this.pending = []
    this.restart()
  }

  private forward() {
    this.prevState = this.timeline.current.state
    const events = this.timeline.forward()
    for (const e of events) {
      if ((e.type === 'pulse.enter' || e.type === 'pulse.branch') && e.codeRef) this.pulseRefs.set(e.pulseId, e.codeRef)
    }
    this.pending.push(...events)
    this.autoFollow()
  }

  // Si el pulso seguido terminó, el panel de código pasa al siguiente pulso vivo.
  private autoFollow() {
    const alive = this.timeline.current.state.pulses.filter((p) => p.status === 'alive')
    if (this.followed !== undefined && alive.some((p) => p.id === this.followed)) return
    if (this.inspected) return // el jugador eligió mirar un nodo: no se lo quitamos
    this.followed = alive[0]?.id ?? this.followed
  }

  private finish() {
    if (this.status === 'done') return
    this.playing = false
    this.status = 'done'
    this.result = evaluate(this.level, this.variant)
    if (!this.result.won) this.failedRuns++
    this.emit()
  }

  private did(action: PlayerAction) {
    this.actions.add(action)
    this.emit()
  }

  private emit() {
    for (const fn of this.listeners) fn()
  }
}
