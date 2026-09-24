import { isDone, step, type Sim } from './sim'
import type { SimEvent } from './types'

// Como `step` es puro, un snapshot es solo una referencia: retroceder = restaurar y re-simular.
export class Timeline {
  private readonly snapshots = new Map<number, Sim>()
  private readonly snapshotEvery: number
  private sim: Sim
  private lastEvents: SimEvent[] = []

  constructor(initial: Sim, snapshotEvery = 30) {
    this.snapshotEvery = snapshotEvery
    this.sim = initial
    this.snapshots.set(initial.state.tick, initial)
  }

  get current(): Sim {
    return this.sim
  }

  get tick(): number {
    return this.sim.state.tick
  }

  get done(): boolean {
    return isDone(this.sim)
  }

  // Eventos del último paso hacia adelante (vacío tras retroceder).
  get events(): SimEvent[] {
    return this.lastEvents
  }

  forward(): SimEvent[] {
    if (this.done) return (this.lastEvents = [])
    const r = step(this.sim)
    this.sim = r.sim
    if (this.sim.state.tick % this.snapshotEvery === 0) this.snapshots.set(this.sim.state.tick, this.sim)
    return (this.lastEvents = r.events)
  }

  back(): void {
    this.seek(this.tick - 1)
  }

  seek(target: number): void {
    const t = Math.max(0, target)
    let base = 0
    for (const k of this.snapshots.keys()) if (k <= t && k > base) base = k
    this.sim = this.snapshots.get(base)!
    while (this.tick < t && !this.done) this.sim = step(this.sim).sim
    this.lastEvents = []
  }

  reset(): void {
    this.seek(0)
  }
}
