import {
  buildCircuit,
  codeKey,
  evaluate,
  scenarioFor,
  type ChangeTicket,
  type Evaluation,
  type Level,
  type PatternId,
  type PlayerAction,
  type SocketDef,
  type SocketOption,
  type Variant,
} from '../../engine'
import { Emitter } from '../events/Emitter'
import { initialFlow, reduceFlow, variantFor, type FlowEvent, type FlowState, type Side } from '../flow/levelFlow'
import { Playback } from '../playback/Playback'
import { noteKey, withCompleted, withNote, type Progress, type ProgressStore } from '../progress/progress'

export type ConnectResult = 'repaired' | 'wrong' | 'none'
export type Comparison = Record<Side, Evaluation>

// Fachada de una partida: render y ui solo hablan con esto. Coordina flujo, reproducción y progreso.
export class GameSession {
  readonly level: Level
  readonly actions = new Set<PlayerAction>()
  flow: FlowState = initialFlow()
  repairs: string[] = []
  playback!: Playback
  circuitVersion = 0
  touched: string[] = []
  result?: Evaluation
  comparison?: Comparison
  failedRuns = 0
  progress: Progress

  private readonly emitter = new Emitter()
  private readonly store: ProgressStore

  constructor(level: Level, store: ProgressStore) {
    this.level = level
    this.store = store
    this.progress = store.load()
    this.rebuild()
  }

  subscribe = this.emitter.subscribe

  get variant(): Variant {
    return variantFor(this.level, this.flow, this.repairs)
  }

  get codeFile() {
    return this.level.codeFiles[codeKey(this.level, this.variant)]
  }

  get socket(): SocketDef | undefined {
    return this.level.sockets[0]
  }

  get ticket(): ChangeTicket | undefined {
    return this.level.changeTickets[0]
  }

  get pendingRepairs() {
    return this.level.repairs.filter((r) => !this.repairs.includes(r.id))
  }

  get pluggedOption(): SocketOption | undefined {
    const p = this.flow.plugged
    return p ? this.level.sockets.find((s) => s.id === p.socketId)?.options[p.pattern] : undefined
  }

  get inventoryOpen() {
    return this.flow.stage === 'choose'
  }

  // Llamado por el render en cada frame.
  update(deltaFrames: number) {
    const wasPlaying = this.playback.playing
    const advanced = this.playback.update(deltaFrames)
    if (wasPlaying && this.playback.done) this.runFinished()
    else if (advanced) this.emitter.emit()
  }

  play() {
    if (this.playback.done) this.result = undefined
    this.playback.play()
    this.did('play')
  }

  pause() {
    this.playback.pause()
    this.did('pause')
  }

  toggle() {
    if (this.playback.playing) this.pause()
    else this.play()
  }

  step() {
    const wasDone = this.playback.done
    this.playback.step()
    if (!wasDone && this.playback.done) this.runFinished()
    this.did('step')
  }

  back() {
    this.playback.back()
    this.did('back')
  }

  reset() {
    this.playback.pause()
    this.playback.restart()
    this.result = undefined
    this.did('reset')
  }

  setSpeed(speed: number) {
    this.playback.speed = speed
    this.did('speed')
  }

  inspect(nodeId: string | undefined) {
    this.playback.inspect(nodeId)
    this.did('inspect-node')
  }

  follow(pulseId: number) {
    this.playback.follow(pulseId)
    this.did('follow-pulse')
  }

  // Arrastrar un cable: si coincide con una reparación pendiente, se aplica y se vuelve a correr.
  connect(from: string, to: string): ConnectResult {
    if (from === to) return 'none'
    const repair = this.pendingRepairs.find((r) => r.patch.add?.wires?.some((w) => w.from === from && w.to === to))
    if (!repair) return 'wrong'
    this.repairs = [...this.repairs, repair.id]
    this.rerun()
    this.did('repair')
    return 'repaired'
  }

  plug(pattern: PatternId, socketId = this.socket?.id): SocketOption | undefined {
    const socket = this.level.sockets.find((s) => s.id === socketId)
    const option = socket?.options[pattern]
    if (!socket || !option || !this.inventoryOpen) return undefined
    this.dispatch({ type: 'plug', socketId: socket.id, pattern, outcome: option.outcome })
    this.rerun()
    return option
  }

  unplug() {
    this.dispatch({ type: 'unplug' })
    this.rerun(false)
  }

  continue() {
    const before = this.flow.stage
    this.dispatch({ type: 'continue' })
    if (this.flow.stage === before) return
    if (this.flow.stage === 'compare') this.comparison = this.compare()
    this.rerun(false)
  }

  applyTicket() {
    this.dispatch({ type: 'apply-ticket' })
    this.rerun()
  }

  showSide(side: Side) {
    this.dispatch({ type: 'compare', side })
    this.rerun()
  }

  finishLevel() {
    this.dispatch({ type: 'finish' })
    this.completeIfDone()
    this.emitter.emit()
  }

  private compare(): Comparison {
    const at = (side: Side) => evaluate(this.level, variantFor(this.level, { ...this.flow, stage: 'compare', side }, this.repairs))
    return { without: at('without'), with: at('with') }
  }

  private runFinished() {
    const variant = this.variant
    this.result = evaluate(this.level, variant)
    if (!this.result.won) this.failedRuns++
    const plugged = this.flow.plugged
    if (this.flow.stage === 'choose' && plugged) this.saveProgress(withNote(this.progress, noteKey(this.level.id, plugged.pattern)))
    this.dispatch({ type: 'run-finished', won: this.result.won })
    this.completeIfDone()
    this.emitter.emit()
  }

  private completeIfDone() {
    if (this.flow.stage === 'complete') this.saveProgress(withCompleted(this.progress, this.level.id))
  }

  private saveProgress(next: Progress) {
    if (next === this.progress) return
    this.progress = next
    this.store.save(next)
  }

  private dispatch(event: FlowEvent) {
    this.flow = reduceFlow(this.level, this.flow, event)
  }

  // Reconstruye el circuito para el estado actual del flujo; por defecto arranca a correr solo.
  private rerun(autoplay = true) {
    this.rebuild()
    if (autoplay) this.play()
    else this.emitter.emit()
  }

  private rebuild() {
    const variant = this.variant
    const built = buildCircuit(this.level, variant)
    const previous = this.playback
    this.playback = new Playback(built.circuit, scenarioFor(this.level, variant), previous?.speed)
    if (previous?.inspected) this.playback.inspect(previous.inspected)
    this.touched = built.touched
    this.result = undefined
    this.circuitVersion++
  }

  private did(action: PlayerAction) {
    this.actions.add(action)
    this.emitter.emit()
  }
}
