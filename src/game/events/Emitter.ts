export class Emitter {
  private readonly listeners = new Set<() => void>()

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  emit() {
    for (const fn of this.listeners) fn()
  }
}
