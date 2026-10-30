import {
  buildCircuit,
  CODE_LANGS,
  codeKey,
  diffLines,
  diffStats,
  evaluate,
  PATTERNS,
  scenarioFor,
  score,
  type ChangeTicket,
  type CodeLang,
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
import { msg, N, type Message } from '../../i18n'
import { Emitter } from '../events/Emitter'
import { hintLadder } from '../learning/hints'
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

// Pattern names are keys, so "A + B" is a message with holes rather than a concatenation.
const joinNames = (names: string[]): Message => names.reduceRight<Message>((tail, head) => (tail === '' ? head : msg('game.names.join', { head, tail })), '')

// What the host of the course hears about: the level the player opened and the one they just completed.
export type UnitEvents = { started?: (unitId: string) => void; completed?: (unitId: string) => void }

export type ConnectResult ='repaired' | 'wrong' | 'none'
export type CodeChange = { title: Message; lines: DiffLine[]; added: number; removed: number }
export type Comparison = Record<Side, Evaluation>

// Facade of a game: render and ui only talk to this. It coordinates flow, playback and progress.
export class GameSession {
  readonly level: Level
  readonly actions = new Set<PlayerAction>()
  flow: FlowState = initialFlow()
  repairs: string[] = []
  playback!: Playback
  private built: Variant = {} // what the circuit and the code show: a plug waits for its prediction
  circuitVersion = 0
  touched: string[] = []
  result?: Evaluation
  comparison?: Comparison
  failedRuns = 0
  progress: Progress
  prediction?: Prediction // the open question (without `guess`) or the last answered one
  hintsShown = 0

  private readonly emitter = new Emitter()
  private readonly store: ProgressStore
  private readonly units: UnitEvents

  constructor(level: Level, store: ProgressStore, units: UnitEvents = {}) {
    this.level = level
    this.store = store
    this.units = units
    this.progress = store.load()
    this.rebuild()
    units.started?.(level.id)
  }

  subscribe = this.emitter.subscribe

  get variant(): Variant {
    return variantFor(this.level, this.flow, this.repairs)
  }

  // Language of the code panel; if the level does not provide it, Ruby is shown.
  codeLang: CodeLang = 'rb'

  setCodeLang(lang: CodeLang) {
    this.codeLang = lang
    this.emitter.emit()
  }

  get availableCodeLangs(): CodeLang[] {
    return CODE_LANGS.filter((lang) => Object.keys(this.level.codeFiles[lang]).length > 0)
  }

  // The language actually shown (Ruby if the level does not provide the chosen one).
  get shownCodeLang(): CodeLang {
    return this.availableCodeLangs.includes(this.codeLang) ? this.codeLang : 'rb'
  }

  private get files() {
    return this.level.codeFiles[this.shownCodeLang]
  }

  get codeFile() {
    return this.files[codeKey(this.level, this.built)]
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

  // The most recently plugged option: the one the field note comments on.
  get pluggedOption(): SocketOption | undefined {
    return lastPluggedOption(this.level, this.flow)
  }

  get pluggedPatterns(): PatternId[] {
    return pluggedPatterns(this.level, this.flow)
  }

  get pendingSockets(): SocketDef[] {
    return pendingSockets(this.level, this.flow)
  }

  // Pattern running now in each socket (in the "without pattern" comparison, none).
  pluggedAt(socketId: string): PatternId | undefined {
    return this.variant.sockets?.find((p) => p.id === socketId)?.pattern
  }

  // Level goal metrics that change between without and with pattern: the comparison rows.
  get comparisonRows(): MetricName[] {
    const cmp = this.comparison
    if (!cmp) return []
    return [...new Set(this.level.winWhen.map((a) => a.metric))].filter((m) => cmp.with.metrics[m] !== cmp.without.metrics[m])
  }

  // In the comparison: which Ruby lines change. With a ticket, what the ticket forced to touch on the side
  // being viewed (without or with pattern); without a ticket, from the code without pattern to the code with pattern.
  get codeChange(): CodeChange | undefined {
    if (this.flow.stage !== 'compare' && this.flow.stage !== 'complete') return undefined
    const code = (stage: FlowState['stage'], side: Side) => this.files[codeKey(this.level, variantFor(this.level, { ...this.flow, stage, side }, this.repairs))]
    const side = this.flow.side
    const names = joinNames(this.pluggedPatterns.map((p) => PATTERNS[p].name))
    // 'observe' = base circuit and 'choose' = with pattern, both without ticket; 'compare' = the chosen side, with ticket.
    const [before, after, title] = this.ticket
      ? [code(side === 'with' ? 'choose' : 'observe', side), code('compare', side), side === 'with' ? msg('game.diff.ticketWith', { names }) : N('game.diff.ticketWithout')]
      : [code('compare', 'without'), code('compare', 'with'), msg('game.diff.withoutToWith', { names })]
    if (!before || !after) return undefined
    const lines = diffLines(before.text, after.text)
    return { title, lines, ...diffStats(lines) }
  }

  // Result of the pattern in a given socket, or in the first one that offers it.
  outcomeOf(pattern: PatternId): SocketOption['outcome'] | undefined {
    const socketId = Object.values(this.flow.plugs).find((p) => p.pattern === pattern)?.socketId
    const socket = this.level.sockets.find((s) => s.id === socketId) ?? this.level.sockets.find((s) => s.options[pattern])
    return socket?.options[pattern]?.outcome
  }

  accepts(pattern: PatternId, socketId: string): boolean {
    return !!this.level.sockets.find((s) => s.id === socketId)?.options[pattern]
  }

  // A question is waiting for an answer: the run does not start until it is answered or skipped.
  get awaitingPrediction(): boolean {
    return !!this.prediction && this.prediction.guess === undefined
  }

  // Staged hints for the pending socket: revealed one at a time, on the player's request.
  get hintLadder(): Message[] {
    return this.flow.stage === 'choose' ? hintLadder(this.level, this.flow, this.result) : []
  }

  nextHint() {
    if (this.hintsShown >= this.hintLadder.length) return
    this.hintsShown++
    this.emitter.emit()
  }

  get inventoryOpen() {
    return this.flow.stage === 'choose'
  }

  // Called by the render every frame.
  update(deltaFrames: number) {
    const wasPlaying = this.playback.playing
    const advanced = this.playback.update(deltaFrames)
    if (wasPlaying && this.playback.done) this.runFinished()
    else if (advanced) this.emitter.emit()
  }

  play() {
    if (this.awaitingPrediction && this.prediction?.kind === 'outcome') {
      this.prediction = undefined // running without answering = skipping
      this.rebuild()
    }
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

  // Dragging a wire: if it matches a pending repair, it is applied and the run restarts.
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
    this.emitter.emit()
    return option
  }

  unplug(socketId: string) {
    this.dispatch({ type: 'unplug', socketId })
    this.prediction = undefined
    this.rerun(false)
  }

  // Answering the open question: the result is recorded and whatever was waiting continues.
  predict(guess: string) {
    if (!this.prediction || !this.awaitingPrediction) return
    this.prediction = guessed(this.prediction, guess)
    this.saveProgress(withPrediction(this.progress, isRight(this.prediction)))
    if (this.prediction.kind === 'touched') this.applyTicket()
    else this.rerun()
  }

  skipPrediction() {
    const kind = this.prediction?.kind
    this.prediction = undefined
    if (kind === 'touched') this.applyTicket()
    else this.rerun()
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

  // Review writes through the session: that way there is a single owner of progress and nothing gets overwritten.
  recordReview(itemId: string, correct: boolean, now = Date.now()) {
    this.saveProgress({ ...this.progress, review: recordAnswer(this.progress.review, itemId, correct, now) })
    this.emitter.emit()
  }

  resetProgress() {
    this.saveProgress(emptyProgress())
    this.emitter.emit()
  }

  // Nodes the ticket would touch with what is plugged now: the answer to the change prediction.
  private ticketTouched(): number {
    return buildCircuit(this.level, variantFor(this.level, { ...this.flow, ticket: 'applied' }, this.repairs)).touched.length
  }

  private compare(): Comparison {
    const at = (side: Side) => evaluate(this.level, variantFor(this.level, { ...this.flow, stage: 'compare', side }, this.repairs))
    return { without: at('without'), with: at('with') }
  }

  // The run already finished in playback: scoring its final state is enough.
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
    const completedNow = next.completed.includes(this.level.id) && !this.progress.completed.includes(this.level.id)
    this.progress = next
    this.store.save(next)
    if (completedNow) this.units.completed?.(this.level.id)
  }

  private dispatch(event: FlowEvent) {
    this.flow = reduceFlow(this.level, this.flow, event)
  }

  // Rebuilds the circuit for the current flow state; by default it starts running on its own.
  private rerun(autoplay = true) {
    this.rebuild()
    if (autoplay) this.play()
    else this.emitter.emit()
  }

  private rebuild() {
    const variant = this.variant
    const built = buildCircuit(this.level, variant)
    this.built = variant
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
