import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
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

describe('GameSession · detalles', () => {
  const inChoose = (id: string) => {
    const s = session(id)
    runOut(s)
    return s
  }

  it('con varios sockets, un patrón sin socket va al primero sin resolver que lo acepte', () => {
    const s = inChoose('L15-sucursales-y-pagos')
    const [first] = s.sockets
    const pattern = first.inventory.find((p) => first.options[p]?.outcome === 'solves')!
    s.plug(pattern)
    expect(s.flow.plugs[first.id]?.pattern).toBe(pattern)
    expect(s.pendingSockets.map((k) => k.id)).not.toContain(first.id)
    expect(s.accepts(pattern, first.id)).toBe(true)
  })

  it('un patrón en un socket que no lo acepta no hace nada', () => {
    const s = inChoose('L01-strategy')
    expect(s.plug('strategy', 'no-existe')).toBeUndefined()
    expect(s.flow.plugs).toEqual({})
  })

  it('desenchufar vuelve al circuito sin patrón y no lo corre solo', () => {
    const s = inChoose('L01-strategy')
    s.plug('strategy')
    const [socket] = s.sockets
    s.unplug(socket.id)
    expect(s.pluggedAt(socket.id)).toBeUndefined()
    expect(s.playback.playing).toBe(false)
  })

  it('conectar un nodo consigo mismo no cuenta como intento', () => {
    expect(session('L00-tutorial').connect('cobrar', 'cobrar')).toBe('none')
  })

  it('reiniciar borra el resultado; reconstruir conserva velocidad y nodo inspeccionado', () => {
    const s = inChoose('L01-strategy')
    expect(s.result).toBeDefined()
    s.setSpeed(2)
    s.inspect('cobrar')
    s.reset()
    expect(s.result).toBeUndefined()
    s.plug('strategy')
    expect(s.playback.speed).toBe(2)
    expect(s.playback.inspected).toBe('cobrar')
  })

  it('la calificación de la corrida coincide con evaluar la variante desde cero', () => {
    const s = inChoose('L10-observer')
    s.plug('observer')
    runOut(s)
    expect(s.result).toEqual(evaluate(s.level, s.variant))
  })

  it('la comparación lista solo las métricas objetivo que cambian', () => {
    const s = session('L01-strategy')
    runOut(s)
    s.plug('strategy')
    runOut(s)
    s.continue()
    s.applyTicket()
    runOut(s)
    s.continue()
    expect(s.comparisonRows.length).toBeGreaterThan(0)
    for (const m of s.comparisonRows) expect(s.comparison!.with.metrics[m]).not.toBe(s.comparison!.without.metrics[m])
  })

  it('borrar el progreso lo vacía en el almacén', () => {
    const store = new MemoryProgressStore({ version: 1, completed: ['L00-tutorial'], notes: ['L01-strategy:observer'] })
    const s = session('L01-strategy', store)
    s.resetProgress()
    expect(store.load()).toEqual({ version: 1, completed: [], notes: [] })
  })
})
