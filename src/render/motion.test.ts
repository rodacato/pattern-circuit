import { describe, expect, it } from 'vitest'
import { APPEAR_FRAMES, easeOutBack, NodeAnimations } from './motion'

describe('animaciones de nodo', () => {
  it('un destello se apaga solo', () => {
    const a = new NodeAnimations()
    a.flash('n', 0xff0000)
    expect(a.sample('n').flash?.color).toBe(0xff0000)
    for (let i = 0; i < 20; i++) a.advance('n')
    expect(a.sample('n').flash).toBeUndefined()
  })

  it('un nodo nuevo crece hasta tamaño 1 en APPEAR_FRAMES frames', () => {
    const a = new NodeAnimations()
    a.appear('n')
    expect(a.sample('n').grow).toBeCloseTo(0)
    for (let i = 0; i < APPEAR_FRAMES; i++) a.advance('n')
    expect(a.sample('n').grow).toBe(1)
  })

  it('la sacudida decae a cero', () => {
    const a = new NodeAnimations()
    a.shake('n', 1)
    for (let i = 0; i < 30; i++) a.advance('n')
    expect(a.sample('n').shake).toBe(0)
  })

  it('con movimiento reducido no hay sacudidas ni rebotes', () => {
    const a = new NodeAnimations(true)
    a.shake('n', 1)
    a.appear('n')
    expect(a.sample('n')).toMatchObject({ shake: 0, grow: 1 })
  })

  it('easeOutBack va de 0 a 1 pasándose un poco', () => {
    expect(easeOutBack(0)).toBeCloseTo(0)
    expect(easeOutBack(1)).toBe(1)
    expect(Math.max(...[0.6, 0.7, 0.8].map(easeOutBack))).toBeGreaterThan(1)
  })
})
