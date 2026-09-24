import { describe, expect, it } from 'vitest'
import { line, scenario } from '../../engine/testing'
import { Playback } from './Playback'

const circuit = () => {
  const c = line({ src: { type: 'source' }, a: { type: 'pass' }, out: { type: 'sink' } })
  c.nodes[1].codeRef = 'A#run'
  return c
}

describe('Playback', () => {
  it('avanza según la velocidad y se detiene al terminar', () => {
    const p = new Playback(circuit(), scenario({ at: 0 }), 2)
    p.play()
    expect(p.update(1)).toBe(2)
    while (!p.done) p.update(10)
    expect(p.playing).toBe(false)
  })

  it('sin play no avanza', () => {
    const p = new Playback(circuit(), scenario({ at: 0 }))
    expect(p.update(5)).toBe(0)
  })

  it('sigue al primer pulso vivo y expone su región de código', () => {
    const p = new Playback(circuit(), scenario({ at: 0 }, { at: 5 }))
    for (let i = 0; i < 40; i++) p.step()
    expect(p.followed).toBe(1)
    expect(p.activeRef).toBe('A#run')
  })

  it('inspeccionar un nodo gana sobre el seguimiento automático', () => {
    const p = new Playback(circuit(), scenario({ at: 0 }))
    p.inspect('out')
    for (let i = 0; i < 40; i++) p.step()
    expect(p.followed).toBeUndefined()
    p.inspect('no-existe')
    expect(p.inspected).toBeUndefined()
  })

  it('reiniciar limpia foco y eventos pendientes', () => {
    const p = new Playback(circuit(), scenario({ at: 0 }))
    for (let i = 0; i < 10; i++) p.step()
    p.restart()
    expect(p.timeline.tick).toBe(0)
    expect(p.drainEvents()).toEqual([])
    expect(p.followed).toBeUndefined()
  })
})
