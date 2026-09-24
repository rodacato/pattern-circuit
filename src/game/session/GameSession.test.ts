import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../levels'
import { MemoryProgressStore } from '../progress/progress'
import { GameSession } from './GameSession'

const session = (id: string, store = new MemoryProgressStore()) => new GameSession(LEVELS.find((l) => l.id === id)!, store)

const runOut = (s: GameSession) => {
  if (!s.playback.playing) s.play()
  for (let i = 0; i < 10_000 && s.playback.playing; i++) s.update(1)
}

describe('GameSession · nivel 0', () => {
  it('sin reparar se pierde; con el cable correcto se completa y se guarda', () => {
    const store = new MemoryProgressStore()
    const s = session('L00-tutorial', store)
    runOut(s)
    expect(s.result?.won).toBe(false)
    expect(s.failedRuns).toBe(1)

    expect(s.connect('cliente', 'entregar')).toBe('wrong')
    expect(s.connect('preparar', 'entregar')).toBe('repaired')
    expect(s.codeFile.text).toContain('@counter.hand_over(order)')
    runOut(s)
    expect(s.flow.stage).toBe('complete')
    expect(store.load().completed).toEqual(['L00-tutorial'])
  })

  it('paso adelante y atrás vuelven al mismo tick', () => {
    const s = session('L00-tutorial')
    for (let i = 0; i < 10; i++) s.step()
    s.back()
    expect(s.playback.timeline.tick).toBe(9)
    expect(s.actions).toEqual(new Set(['step', 'back']))
  })
})

describe('GameSession · nivel 1 (Strategy)', () => {
  it('recorre el nivel completo: problema, patrones, cambio y comparación', () => {
    const store = new MemoryProgressStore()
    const s = session('L01-strategy', store)
    expect(s.plug('strategy')).toBeUndefined() // el inventario abre después de ver el problema

    runOut(s)
    expect(s.flow.stage).toBe('choose')

    expect(s.plug('observer')?.outcome).toBe('misfit')
    runOut(s)
    expect(s.result?.metrics.duplicatesAtSink).toBe(6)
    s.continue()
    expect(s.flow.stage).toBe('choose')

    s.plug('strategy')
    runOut(s)
    expect(s.flow.solved).toBe(true)
    s.continue()
    expect(s.flow.stage).toBe('change')

    s.applyTicket()
    runOut(s)
    expect(s.touched).toEqual([])
    s.continue()
    expect(s.flow.stage).toBe('compare')
    expect(s.comparison?.without.metrics.nodesTouched).toBe(1)
    expect(s.comparison?.with.metrics.nodesTouched).toBe(0)

    s.showSide('without')
    expect(s.touched).toEqual(['cobrar'])
    s.finishLevel()
    expect(s.flow.stage).toBe('complete')
    expect(store.load()).toMatchObject({ completed: ['L01-strategy'], notes: ['L01-strategy:observer', 'L01-strategy:strategy'] })
  })
})
