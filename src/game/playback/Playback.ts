import { compile, createSim, Timeline, type Circuit, type CompiledCircuit, type Scenario, type SimEvent, type SimState } from '../../engine'

export const SPEEDS = [0.5, 1, 2, 4] as const

// Plays a simulation in real time: speed, steps, interpolation and which code to look at.
export class Playback {
  readonly circuit: CompiledCircuit
  readonly timeline: Timeline
  prevState: SimState
  alpha = 1 // fraction between prevState and the current state, to interpolate
  playing = false
  speed: number
  followed?: number
  inspected?: string

  private carry = 0
  private pending: SimEvent[] = []
  private pulseRefs = new Map<number, { tick: number; ref: string }[]>() // regions each pulse visited

  constructor(circuit: Circuit, scenario: Scenario, speed = 1) {
    this.circuit = compile(circuit)
    this.timeline = new Timeline(createSim(circuit, scenario))
    this.prevState = this.timeline.current.state
    this.speed = speed
  }

  get done() {
    return this.timeline.done
  }

  // Active region: the followed pulse's; if none, the inspected node's.
  get activeRef(): string | undefined {
    const visited = this.followed !== undefined ? this.pulseRefs.get(this.followed) : undefined
    // After going back, only regions visited up to the current tick count.
    const ref = visited?.findLast((v) => v.tick < this.timeline.tick)?.ref
    if (ref) return ref
    return this.inspected ? this.circuit.nodes.get(this.inspected)?.codeRef : undefined
  }

  // `deltaFrames` comes from the render ticker (1 ≈ 1/60 s). Returns how many ticks it advanced.
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
      if ((e.type === 'pulse.enter' || e.type === 'pulse.branch') && e.codeRef) {
        const visited = (this.pulseRefs.get(e.pulseId) ?? []).filter((v) => v.tick < e.tick) // when re-simulating after going back
        visited.push({ tick: e.tick, ref: e.codeRef })
        this.pulseRefs.set(e.pulseId, visited)
      }
    }
    this.pending.push(...events)
    this.autoFollow()
  }

  // If the followed pulse finished, focus moves to the next live one; if the player chose a node, that is respected.
  private autoFollow() {
    if (this.inspected) return
    const alive = this.timeline.current.state.pulses.filter((p) => p.status === 'alive')
    if (this.followed !== undefined && alive.some((p) => p.id === this.followed)) return
    this.followed = alive[0]?.id ?? this.followed
  }
}
