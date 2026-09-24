import {
  buildCircuit,
  codeKey,
  diffLines,
  diffStats,
  evaluate,
  PATTERNS,
  scenarioFor,
  score,
  type ChangeTicket,
  type DiffLine,
  type Evaluation,
  type Level,
  type MetricName,
  type PatternId,
  type PlayerAction,
  type SocketDef,
  type SocketOption,
  type Variant,
} from '../../engine'
import { Emitter } from '../events/Emitter'
import { recordAnswer } from '../learning/review'
import { guessed, isRight, outcomePrediction, touchedPrediction, type Prediction } from '../learning/prediction'
import {
  initialFlow,
  lastPluggedOption,
  pendingSockets,
  pluggedPatterns,
  reduceFlow,
  targetSocket,
  variantFor,
  type FlowEvent,
  type FlowState,
  type Side,
} from '../flow/levelFlow'
import { Playback } from '../playback/Playback'
import { emptyProgress, withCompleted, withNotes, withPrediction, type Progress, type ProgressStore } from '../progress/progress'

export type ConnectResult = 'repaired' | 'wrong' | 'none'
export type CodeChange = { title: string; lines: DiffLine[]; added: number; removed: number }
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
  prediction?: Prediction // la pregunta abierta (sin `guess`) o la última respondida

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

  get sockets(): SocketDef[] {
    return this.level.sockets
  }

  get ticket(): ChangeTicket | undefined {
    return this.level.changeTickets[0]
  }

  get pendingRepairs() {
    return this.level.repairs.filter((r) => !this.repairs.includes(r.id))
  }

  // La opción enchufada más recientemente: la que comenta la nota de campo.
  get pluggedOption(): SocketOption | undefined {
    return lastPluggedOption(this.level, this.flow)
  }

  get pluggedPatterns(): PatternId[] {
    return pluggedPatterns(this.level, this.flow)
  }

  get pendingSockets(): SocketDef[] {
    return pendingSockets(this.level, this.flow)
  }

  // Patrón que corre ahora en cada socket (en la comparación "sin patrón", ninguno).
  pluggedAt(socketId: string): PatternId | undefined {
    return this.variant.sockets?.find((p) => p.id === socketId)?.pattern
  }

  // Métricas objetivo del nivel que cambian entre sin y con patrón: las filas de la comparación.
  get comparisonRows(): MetricName[] {
    const cmp = this.comparison
    if (!cmp) return []
    return [...new Set(this.level.winWhen.map((a) => a.metric))].filter((m) => cmp.with.metrics[m] !== cmp.without.metrics[m])
  }

  // En la comparación: qué líneas de Ruby cambian. Con ticket, lo que el ticket obligó a tocar en el lado
  // que se está mirando (sin o con patrón); sin ticket, del código sin patrón al código con patrón.
  get codeChange(): CodeChange | undefined {
    if (this.flow.stage !== 'compare' && this.flow.stage !== 'complete') return undefined
    const code = (stage: FlowState['stage'], side: Side) => this.level.codeFiles[codeKey(this.level, variantFor(this.level, { ...this.flow, stage, side }, this.repairs))]
    const side = this.flow.side
    const names = this.pluggedPatterns.map((p) => PATTERNS[p].name).join(' + ')
    // 'observe' = circuito base y 'choose' = con patrón, ambos sin ticket; 'compare' = el lado elegido, con ticket.
    const [before, after, title] = this.ticket
      ? [code(side === 'with' ? 'choose' : 'observe', side), code('compare', side), `Lo que cambió con el ticket, ${side === 'with' ? `con ${names}` : 'sin patrón'}`]
      : [code('compare', 'without'), code('compare', 'with'), `Del código sin patrón al código con ${names}`]
    if (!before || !after) return undefined
    const lines = diffLines(before.text, after.text)
    return { title, lines, ...diffStats(lines) }
  }

  // Resultado del patrón en un socket concreto, o en el primero que lo ofrece.
  outcomeOf(pattern: PatternId): SocketOption['outcome'] | undefined {
    const socketId = Object.values(this.flow.plugs).find((p) => p.pattern === pattern)?.socketId
    const socket = this.level.sockets.find((s) => s.id === socketId) ?? this.level.sockets.find((s) => s.options[pattern])
    return socket?.options[pattern]?.outcome
  }

  accepts(pattern: PatternId, socketId: string): boolean {
    return !!this.level.sockets.find((s) => s.id === socketId)?.options[pattern]
  }

  // Hay una pregunta esperando respuesta: la corrida no arranca hasta responderla u omitirla.
  get awaitingPrediction(): boolean {
    return !!this.prediction && this.prediction.guess === undefined
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
    if (this.awaitingPrediction && this.prediction?.kind === 'outcome') this.prediction = undefined // correr sin responder = omitir
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

  plug(pattern: PatternId, socketId?: string): SocketOption | undefined {
    const socket = targetSocket(this.level, this.flow, pattern, socketId)
    const option = socket?.options[pattern]
    if (!socket || !option || !this.inventoryOpen) return undefined
    this.dispatch({ type: 'plug', socketId: socket.id, pattern, outcome: option.outcome })
    this.prediction = outcomePrediction(PATTERNS[pattern].name, option.outcome)
    this.rerun(false)
    return option
  }

  unplug(socketId: string) {
    this.dispatch({ type: 'unplug', socketId })
    this.prediction = undefined
    this.rerun(false)
  }

  // Responder la pregunta abierta: se anota el acierto y sigue lo que estaba esperando.
  predict(guess: string) {
    if (!this.prediction || !this.awaitingPrediction) return
    this.prediction = guessed(this.prediction, guess)
    this.saveProgress(withPrediction(this.progress, isRight(this.prediction)))
    if (this.prediction.kind === 'touched') this.applyTicket()
    else this.play()
  }

  skipPrediction() {
    const kind = this.prediction?.kind
    this.prediction = undefined
    if (kind === 'touched') this.applyTicket()
    else this.play()
  }

  continue() {
    const before = this.flow.stage
    this.dispatch({ type: 'continue' })
    if (this.flow.stage === before) return
    if (this.flow.stage === 'compare') this.comparison = this.compare()
    this.prediction = this.flow.stage === 'change' && this.ticket ? touchedPrediction(this.ticketTouched()) : undefined
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

  // El repaso escribe a través de la sesión: así hay un solo dueño del progreso y nada se pisa.
  recordReview(itemId: string, correct: boolean, now = Date.now()) {
    this.saveProgress({ ...this.progress, review: recordAnswer(this.progress.review, itemId, correct, now) })
    this.emitter.emit()
  }

  resetProgress() {
    this.saveProgress(emptyProgress())
    this.emitter.emit()
  }

  // Nodos que tocaría el ticket con lo enchufado ahora: la respuesta de la predicción del cambio.
  private ticketTouched(): number {
    return buildCircuit(this.level, variantFor(this.level, { ...this.flow, ticketApplied: true }, this.repairs)).touched.length
  }

  private compare(): Comparison {
    const at = (side: Side) => evaluate(this.level, variantFor(this.level, { ...this.flow, stage: 'compare', side }, this.repairs))
    return { without: at('without'), with: at('with') }
  }

  // La corrida ya terminó en la reproducción: basta con calificar su estado final.
  private runFinished() {
    this.result = score(this.level, this.playback.timeline.current.state.metrics, this.touched, this.playback.circuit.nodes.size)
    if (!this.result.won) this.failedRuns++
    if (this.flow.stage === 'choose') this.saveProgress(withNotes(this.progress, this.level.id, this.pluggedPatterns))
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
