import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../levels'
import { GameSession } from './GameSession'

const tutorial = () => new GameSession(LEVELS.find((l) => l.id === 'L00-tutorial')!)
const runOut = (s: GameSession) => {
  s.play()
  for (let i = 0; i < 5000 && s.status !== 'done'; i++) s.update(1)
}

describe('GameSession', () => {
  it('sin reparar, la partida termina perdida y cuenta el intento fallido', () => {
    const s = tutorial()
    runOut(s)
    expect(s.result?.won).toBe(false)
    expect(s.failedRuns).toBe(1)
  })

  it('un cable equivocado no cambia nada; el correcto repara y se gana', () => {
    const s = tutorial()
    expect(s.connect('cliente', 'entregar')).toBe('wrong')
    expect(s.connect('preparar', 'entregar')).toBe('repaired')
    expect(s.pendingRepairs).toHaveLength(0)
    expect(s.codeFile.text).toContain('@counter.hand_over(order)')
    runOut(s)
    expect(s.result?.won).toBe(true)
    expect(s.actions.has('repair')).toBe(true)
  })

  it('paso adelante y atrás vuelven al mismo tick', () => {
    const s = tutorial()
    for (let i = 0; i < 10; i++) s.step()
    s.back()
    expect(s.timeline.tick).toBe(9)
    expect(s.actions).toEqual(new Set(['step', 'back']))
  })

  it('inspeccionar un nodo muestra su región aunque haya pulsos corriendo', () => {
    const s = tutorial()
    s.inspect('cobrar')
    s.play()
    for (let i = 0; i < 30; i++) s.update(1)
    expect(s.activeRef).toBe('Cashier#charge')
    s.follow(1)
    expect(s.inspected).toBeUndefined()
  })
})
