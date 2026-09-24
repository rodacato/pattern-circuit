import { compile, createSim, Timeline, type Circuit, type CompiledCircuit, type Scenario, type SimEvent, type SimState } from '../../engine'

export const SPEEDS = [0.5, 1, 2, 4] as const

// Reproduce una simulación en tiempo real: velocidad, pasos, interpolación y qué código mirar.
export class Playback {
  readonly circuit: CompiledCircuit
  readonly timeline: Timeline
  prevState: SimState
  alpha = 1 // fracción entre prevState y el estado actual, para interpolar
  playing = false
  speed: number
  followed?: number
  inspected?: string

  private carry = 0
  private pending: SimEvent[] = []
  private pulseRefs = new Map<number, string>()

  constructor(circuit: Circuit, scenario: Scenario, speed = 1) {
    this.circuit = compile(circuit)
    this.timeline = new Timeline(createSim(circuit, scenario))
    this.prevState = this.timeline.current.state
    this.speed = speed
  }

  get done() {
    return this.timeline.done
  }

  get started() {
    return this.timeline.tick > 0
  }

  // Región activa: la del pulso seguido; si no hay, la del nodo inspeccionado.
  get activeRef(): string | undefined {
    if (this.followed !== undefined && this.pulseRefs.has(this.followed)) return this.pulseRefs.get(this.followed)
    return this.inspected ? this.circuit.nodes.get(this.inspected)?.codeRef : undefined
  }

  // `deltaFrames` viene del ticker del render (1 ≈ 1/60 s). Devuelve cuántos ticks avanzó.
  update(deltaFrames: number): number {
    if (!this.playing) return 0
    this.carry += deltaFrames * this.speed
    let advanced = 0
    while (this.carry >= 1 && !this.done) {
      this.carry -= 1
      this.forward()
      advanced++
    }
    this.alpha = this.done ? 1 : Math.min(this.carry, 1)
    if (this.done) this.playing = false
    return advanced
  }

  play() {
    if (this.done) this.restart()
    this.playing = true
  }

  pause() {
    this.playing = false
  }

  step() {
    this.playing = false
    if (!this.done) this.forward()
    this.alpha = 1
  }

  back() {
    this.playing = false
    this.timeline.back()
    this.prevState = this.timeline.current.state
    this.alpha = 1
  }

  restart() {
    this.timeline.reset()
    this.prevState = this.timeline.current.state
    this.pulseRefs.clear()
    this.followed = undefined
    this.pending = []
    this.carry = 0
    this.alpha = 1
  }

  inspect(nodeId: string | undefined) {
    this.inspected = nodeId && this.circuit.nodes.has(nodeId) ? nodeId : undefined
    this.followed = undefined
  }

  follow(pulseId: number) {
    this.followed = pulseId
    this.inspected = undefined
  }

  drainEvents(): SimEvent[] {
    const events = this.pending
    this.pending = []
    return events
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

  // Si el pulso seguido terminó, el foco pasa al siguiente vivo; si el jugador eligió un nodo, se respeta.
  private autoFollow() {
    if (this.inspected) return
    const alive = this.timeline.current.state.pulses.filter((p) => p.status === 'alive')
    if (this.followed !== undefined && alive.some((p) => p.id === this.followed)) return
    this.followed = alive[0]?.id ?? this.followed
  }
}
