import type { CodeRunner, HostBridge } from './ports'
import { CHANNEL, parseHostMessage, type CourseEvent, type CourseMessage, type HostCommand, type HostInit, type HostMessage, type RunOutcome, type RunRequest } from './protocol'
import type { Transport } from './transport'

export type CourseIdentity = { id: string; version: string; protocol: { min: number; max: number } }

export type EmbeddedOptions = {
  transport: Transport
  course: CourseIdentity
  retryMs?: number // how often the greeting is repeated until the host answers
  giveUpMs?: number // after this long without an answer the course goes standalone
  runTimeoutMs?: number
}

export class HostUnavailable extends Error {}

// The course side of the protocol: greets the host until it answers, then reports events and obeys commands.
export class EmbeddedHostBridge implements HostBridge {
  readonly mode = 'embedded'
  private readonly options: Required<EmbeddedOptions>
  private readonly handlers = new Set<(command: HostCommand) => void>()
  private readonly pendingRuns = new Map<string, (outcome: RunOutcome) => void>()
  private protocol = 0
  private counter = 0
  private init?: HostInit
  private stopListening?: () => void

  constructor(options: EmbeddedOptions) {
    this.options = { retryMs: 400, giveUpMs: 5000, runTimeoutMs: 30_000, ...options }
  }

  get codeRunner(): CodeRunner | undefined {
    return this.init?.features.codeRunner ? { run: (request) => this.run(request) } : undefined
  }

  start(): Promise<HostInit> {
    return new Promise((resolve, reject) => {
      const timers: { retry?: ReturnType<typeof setInterval>; giveUp?: ReturnType<typeof setTimeout> } = {}
      const finish = () => {
        clearInterval(timers.retry)
        clearTimeout(timers.giveUp)
      }
      this.stopListening = this.options.transport.listen((data) => {
        const message = parseHostMessage(data)
        if (!message) return
        if (!this.init && message.type === 'host.incompatible') {
          finish()
          this.stop()
          reject(new HostUnavailable('The host speaks other versions of the protocol'))
        } else if (!this.init && message.type === 'host.init') {
          this.init = message.payload
          this.protocol = message.payload.protocol
          finish()
          resolve(message.payload)
        } else if (this.init) {
          this.receive(message)
        }
      })
      const greet = () => this.send('course.hello', { courseId: this.options.course.id, courseVersion: this.options.course.version, protocol: this.options.course.protocol })
      greet()
      timers.retry = setInterval(greet, this.options.retryMs)
      timers.giveUp = setTimeout(() => {
        finish()
        this.stop()
        reject(new HostUnavailable('The host did not answer'))
      }, this.options.giveUpMs)
    })
  }

  stop() {
    this.stopListening?.()
    this.stopListening = undefined
  }

  emit(event: CourseEvent) {
    switch (event.type) {
      case 'ready': this.send('course.ready', {}); break
      case 'unit.started': this.send('course.unit.started', { unitId: event.unitId }); break
      case 'unit.completed': this.send('course.unit.completed', { unitId: event.unitId, detail: event.detail }); break
      case 'completed': this.send('course.completed', {}); break
      case 'progress': this.send('course.progress', { rev: event.rev, progress: event.progress }); break
      case 'preference.requested': this.send('course.preference.requested', { locale: event.locale, codeLanguage: event.codeLanguage }); break
      case 'resize': this.send('course.resize', { height: event.height }); break
      case 'error': this.send('course.error', { code: event.code, message: event.message }); break
    }
  }

  onCommand(handler: (command: HostCommand) => void) {
    this.handlers.add(handler)
    return () => void this.handlers.delete(handler)
  }

  private receive(message: HostMessage) {
    switch (message.type) {
      case 'host.locale': return this.command({ type: 'locale', value: message.payload.value })
      case 'host.codeLanguage': return this.command({ type: 'codeLanguage', value: message.payload.value })
      case 'host.theme': return this.command({ type: 'theme', theme: message.payload.theme })
      case 'host.progress': return this.command({ type: 'progress', progress: message.payload.progress })
      case 'host.visibility': return this.command({ type: 'visibility', visible: message.payload.visible })
      case 'host.navigate': return this.command({ type: 'navigate', unitId: message.payload.unitId })
      case 'host.code.result': {
        const done = message.replyTo ? this.pendingRuns.get(message.replyTo) : undefined
        if (done && message.replyTo) {
          this.pendingRuns.delete(message.replyTo)
          done(message.payload.outcome)
        }
        return
      }
    }
  }

  private command(command: HostCommand) {
    for (const handler of this.handlers) handler(command)
  }

  private run(request: RunRequest): Promise<RunOutcome> {
    return new Promise((resolve) => {
      const id = this.send('course.code.run', { request })
      const timer = setTimeout(() => {
        this.pendingRuns.delete(id)
        resolve({ kind: 'unavailable', reason: 'The host did not answer in time' })
      }, this.options.runTimeoutMs)
      this.pendingRuns.set(id, (outcome) => {
        clearTimeout(timer)
        resolve(outcome)
      })
    })
  }

  private send<T extends CourseMessage['type']>(type: T, payload: Extract<CourseMessage, { type: T }>['payload']): string {
    const id = `course-${++this.counter}`
    this.options.transport.post({ channel: CHANNEL, v: this.protocol || this.options.course.protocol.max, type, id, payload })
    return id
  }
}
