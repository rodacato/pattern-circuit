import type { HostInit } from '../course-kit'
import { emptyProgress, Progress, type ProgressStore } from '../game/progress/progress'

type HostProgress = HostInit['progress']

// The host stores two things for this course: the units completed (which it understands, and merges by union)
// and an opaque `state` that only this course reads: notes, predictions and the review schedule.
export function fromHostProgress(host: HostProgress): Progress {
  if (!host) return emptyProgress()
  const state = (host.state ?? {}) as Record<string, unknown>
  const parsed = Progress.safeParse({ version: 1, completed: host.completedUnits, notes: state.notes ?? [], predictions: state.predictions, review: state.review })
  return parsed.success ? parsed.data : { ...emptyProgress(), completed: host.completedUnits }
}

export function toHostProgress(progress: Progress): NonNullable<HostProgress> {
  return { completedUnits: progress.completed, state: { notes: progress.notes, predictions: progress.predictions, review: progress.review }, stateVersion: 1 }
}

// Embedded, the host is the record: this store starts from what the host gave and reports every change
// (debounced; a snapshot is idempotent, so a lost one is repaired by the next).
export class HostProgressStore implements ProgressStore {
  private value: Progress
  private revision = 0
  private timer?: ReturnType<typeof setTimeout>
  private readonly report: (revision: number, progress: NonNullable<HostProgress>) => void
  private readonly delayMs: number

  constructor(initial: HostProgress, report: (revision: number, progress: NonNullable<HostProgress>) => void, delayMs = 500) {
    this.value = fromHostProgress(initial)
    this.report = report
    this.delayMs = delayMs
  }

  load() {
    return this.value
  }

  save(progress: Progress) {
    this.value = progress
    clearTimeout(this.timer)
    this.timer = setTimeout(() => this.flush(), this.delayMs)
  }

  // The host replaced the progress (for example after the player signed in and it was merged).
  replace(host: HostProgress) {
    clearTimeout(this.timer)
    this.value = fromHostProgress(host)
  }

  flush() {
    if (this.timer === undefined) return
    clearTimeout(this.timer)
    this.timer = undefined
    this.report(++this.revision, toHostProgress(this.value))
  }
}
