import type { Point } from '../engine'

// Touch gestures without Pixi or DOM: pinch to zoom and double tap. They are tested on their own.
export class Pinch {
  private readonly pointers = new Map<number, Point>()

  down(id: number, p: Point) {
    this.pointers.set(id, p)
  }

  up(id: number) {
    this.pointers.delete(id)
  }

  get active() {
    return this.pointers.size >= 2
  }

  // Moves a finger; with two fingers it returns how much to scale and around which point (the midpoint).
  move(id: number, p: Point): { factor: number; center: Point } | undefined {
    if (!this.pointers.has(id)) return undefined
    const before = this.span()
    this.pointers.set(id, p)
    const after = this.span()
    if (!before || !after || before.distance === 0) return undefined
    return { factor: after.distance / before.distance, center: after.center }
  }

  private span() {
    const [a, b] = [...this.pointers.values()]
    if (!a || !b) return undefined
    return { distance: Math.hypot(b.x - a.x, b.y - a.y), center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
  }
}

// Two taps close in time and space = double tap (touch browsers do not always emit dblclick).
export class DoubleTap {
  private last?: { at: number; p: Point }
  private readonly ms: number
  private readonly slop: number

  constructor(ms = 300, slop = 24) {
    this.ms = ms
    this.slop = slop
  }

  tap(at: number, p: Point): boolean {
    const hit = !!this.last && at - this.last.at <= this.ms && Math.hypot(p.x - this.last.p.x, p.y - this.last.p.y) <= this.slop
    this.last = hit ? undefined : { at, p }
    return hit
  }
}

export const coarsePointer = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
