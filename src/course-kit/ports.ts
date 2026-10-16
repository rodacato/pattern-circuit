import type { CourseEvent, HostCommand, HostInit, RunOutcome, RunRequest } from './protocol'

// What a course needs from the page that shows it. In standalone mode the course is the whole page and the
// bridge answers from the browser itself; embedded, the host answers over postMessage.
export interface HostBridge {
  readonly mode: 'standalone' | 'embedded'
  start(): Promise<HostInit>
  emit(event: CourseEvent): void
  onCommand(handler: (command: HostCommand) => void): () => void
  readonly codeRunner?: CodeRunner
}

export interface CodeRunner {
  run(request: RunRequest): Promise<RunOutcome>
}
