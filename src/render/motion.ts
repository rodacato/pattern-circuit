// Animaciones de nodos por frame (destello, sacudida, aparición). Sin Pixi: se prueban solas.
export const APPEAR_FRAMES = 28

export type NodeMotion = { flash?: { t: number; color: number }; shake: number; grow: number }

export class NodeAnimations {
  private readonly flashes = new Map<string, { t: number; color: number }>()
  private readonly shakes = new Map<string, number>()
  private readonly appearing = new Map<string, number>()
  private readonly reduced: boolean

  // Con movimiento reducido no hay sacudidas ni rebotes; el destello de color sí queda (no se mueve).
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

  // Avanza un frame de cada animación de este nodo y olvida las terminadas.
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

export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
