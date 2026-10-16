// Per-frame node animations (flash, shake, appearance). No Pixi: they are tested on their own.
export const APPEAR_FRAMES = 28

export type NodeMotion = { flash?: { t: number; color: number }; shake: number; grow: number }

export class NodeAnimations {
  private readonly flashes = new Map<string, { t: number; color: number }>()
  private readonly shakes = new Map<string, number>()
  private readonly appearing = new Map<string, number>()
  private readonly reduced: boolean

  // With reduced motion there are no shakes or bounces; the color flash stays (it does not move).
  constructor(reduced = false) {
    this.reduced = reduced
  }

  flash(id: string, color: number, t = 1) {
    this.flashes.set(id, { t, color })
  }

  shake(id: string, amount: number) {
    if (!this.reduced) this.shakes.set(id, amount)
  }

  appear(id: string) {
    if (!this.reduced) this.appearing.set(id, 0)
  }

  sample(id: string): NodeMotion {
    const frame = this.appearing.get(id)
    return { flash: this.flashes.get(id), shake: this.shakes.get(id) ?? 0, grow: frame === undefined ? 1 : easeOutBack(frame / APPEAR_FRAMES) }
  }

  // Advances one frame of each animation of this node and forgets the finished ones.
  advance(id: string) {
    const f = this.flashes.get(id)
    if (f && (f.t -= 0.05) <= 0) this.flashes.delete(id)
    const sh = this.shakes.get(id)
    if (sh !== undefined) {
      if (sh - 0.04 <= 0) this.shakes.delete(id)
      else this.shakes.set(id, sh - 0.04)
    }
    const frame = this.appearing.get(id)
    if (frame !== undefined) {
      if (frame + 1 >= APPEAR_FRAMES) this.appearing.delete(id)
      else this.appearing.set(id, frame + 1)
    }
  }
}

export function easeOutBack(t: number) {
  const c = 1.70158
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}

// A host can ask for reduced motion even when the system does not.
let forced = false
export const forceReducedMotion = (value: boolean) => void (forced = value)

export const prefersReducedMotion = () => forced || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
