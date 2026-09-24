import { describe, expect, it } from 'vitest'
import { DoubleTap, Pinch } from './gestures'

describe('gestos táctiles', () => {
  it('separar dos dedos al doble acerca el zoom al doble, alrededor del punto medio', () => {
    const pinch = new Pinch()
    pinch.down(1, { x: 100, y: 100 })
    expect(pinch.active).toBe(false)
    pinch.down(2, { x: 200, y: 100 })
    expect(pinch.active).toBe(true)
    expect(pinch.move(2, { x: 300, y: 100 })).toEqual({ factor: 2, center: { x: 200, y: 100 } })
  })

  it('con un solo dedo no hay pellizco', () => {
    const pinch = new Pinch()
    pinch.down(1, { x: 0, y: 0 })
    expect(pinch.move(1, { x: 50, y: 0 })).toBeUndefined()
    pinch.down(2, { x: 10, y: 0 })
    pinch.up(2)
    expect(pinch.active).toBe(false)
  })

  it('doble toque: rápido y en el mismo lugar; un tercer toque empieza de nuevo', () => {
    const tap = new DoubleTap(300, 24)
    expect(tap.tap(0, { x: 0, y: 0 })).toBe(false)
    expect(tap.tap(200, { x: 5, y: 5 })).toBe(true)
    expect(tap.tap(300, { x: 5, y: 5 })).toBe(false)
    expect(tap.tap(1000, { x: 5, y: 5 })).toBe(false)
    expect(tap.tap(1100, { x: 200, y: 5 })).toBe(false)
  })
})
