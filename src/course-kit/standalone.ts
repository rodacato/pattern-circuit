import type { HostBridge } from './ports'
import type { CourseEvent, HostCommand, HostInit } from './protocol'

// No host: the course answers for itself. `init` reads what the browser knows (language, saved progress…) and
// `onEvent` lets the course observe its own events (tests, or a page that wants to listen).
export class StandaloneHostBridge implements HostBridge {
  readonly mode = 'standalone'
  private readonly handlers = new Set<(command: HostCommand) => void>()

  private readonly init: () => HostInit
  private readonly onEvent?: (event: CourseEvent) => void

  constructor(init: () => HostInit, onEvent?: (event: CourseEvent) => void) {
    this.init = init
    this.onEvent = onEvent
  }

  start() {
    return Promise.resolve(this.init())
  }

  emit(event: CourseEvent) {
    this.onEvent?.(event)
  }

  onCommand(handler: (command: HostCommand) => void) {
    this.handlers.add(handler)
    return () => void this.handlers.delete(handler)
  }

  // The course's own controls (its language button…) act through the same path a host command would take.
  dispatch(command: HostCommand) {
    for (const handler of this.handlers) handler(command)
  }
}
