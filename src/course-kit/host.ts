import { CHANNEL, parseCourseMessage, type CourseMessage, type HostCommand, type HostInit, type HostMessage, type Progress, type RunOutcome, type RunRequest } from './protocol'
import type { Transport } from './transport'

export type HostHandlers = {
  // What the course starts with; the protocol version is negotiated by the controller.
  init(): Omit<HostInit, 'protocol'>
  unitStarted?(unitId: string): void
  unitCompleted?(unitId: string, detail?: Record<string, number | string | boolean>): void
  courseCompleted?(): void
  progress?(rev: number, progress: Progress): void
  preferenceRequested?(preference: { locale?: string; codeLanguage?: string }): void
  ready?(): void
  error?(error: { code: string; message: string }): void
  runCode?(request: RunRequest): Promise<RunOutcome>
}

export type HostControllerOptions = {
  transport: Transport
  supported: { min: number; max: number } // the protocol versions this host speaks
  handlers: HostHandlers
}

// The host side of the protocol (a Dojo player, or the test page of this repo): answers the course's greeting,
// hears its events, runs its code and sends it commands. It only ever sees messages of the verified course.
export function createHostController({ transport, supported, handlers }: HostControllerOptions) {
  let negotiated = 0
  let counter = 0
  const send = <T extends HostMessage['type']>(type: T, payload: Extract<HostMessage, { type: T }>['payload'], replyTo?: string) =>
    transport.post({ channel: CHANNEL, v: negotiated || supported.max, type, id: `host-${++counter}`, replyTo, payload })

  const handle = (message: CourseMessage) => {
    switch (message.type) {
      case 'course.hello': {
        const { min, max } = message.payload.protocol
        const common = Math.min(max, supported.max)
        if (common < Math.max(min, supported.min)) return send('host.incompatible', { hostProtocol: supported })
        negotiated = common
        return send('host.init', { ...handlers.init(), protocol: common })
      }
      case 'course.ready': return handlers.ready?.()
      case 'course.unit.started': return handlers.unitStarted?.(message.payload.unitId)
      case 'course.unit.completed': return handlers.unitCompleted?.(message.payload.unitId, message.payload.detail)
      case 'course.completed': return handlers.courseCompleted?.()
      case 'course.progress': return handlers.progress?.(message.payload.rev, message.payload.progress)
      case 'course.preference.requested': return handlers.preferenceRequested?.(message.payload)
      case 'course.error': return handlers.error?.(message.payload)
      case 'course.resize': return
      case 'course.code.run': {
        const unavailable: RunOutcome = { kind: 'unavailable', reason: 'This host does not run code' }
        const outcome = handlers.runCode ? handlers.runCode(message.payload.request).catch((e: unknown): RunOutcome => ({ kind: 'unavailable', reason: String(e) })) : Promise.resolve(unavailable)
        void outcome.then((result) => send('host.code.result', { outcome: result }, message.id))
      }
    }
  }

  const stop = transport.listen((data) => {
    const message = parseCourseMessage(data)
    if (message) handle(message)
  })

  return {
    stop,
    send(command: HostCommand) {
      switch (command.type) {
        case 'locale': return send('host.locale', { value: command.value })
        case 'codeLanguage': return send('host.codeLanguage', { value: command.value })
        case 'theme': return send('host.theme', { theme: command.theme })
        case 'progress': return send('host.progress', { progress: command.progress })
        case 'visibility': return send('host.visibility', { visible: command.visible })
        case 'navigate': return send('host.navigate', { unitId: command.unitId })
      }
    },
  }
}
