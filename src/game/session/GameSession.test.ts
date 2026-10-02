import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import { identity } from '../../i18n'
import { LEVELS } from '../../levels'
import { emptyProgress, MemoryProgressStore } from '../progress/progress'
import { GameSession } from './GameSession'

const session = (id: string, store = new MemoryProgressStore()) => new GameSession(LEVELS.find((l) => l.id === id)!, store)

const runOut = (s: GameSession) => {
  if (!s.playback.playing) s.play()
  for (let i = 0; i < 10_000 && s.playback.playing; i++) s.update(1)
}

describe('GameSession · nivel 0', () => {
  it('sin reparar se pierde; con el cable correcto se completa y se guarda', () => {
    const store = new MemoryProgressStore()
    const s = session('tutorial', store)
    runOut(s)
    expect(s.result?.won).toBe(false)
    expect(s.failedRuns).toBe(1)

    expect(s.connect('customer', 'handOver')).toBe('wrong')
    expect(s.connect('prepare', 'handOver')).toBe('repaired')
    expect(s.codeFile.text).toContain('@counter.hand_over(order)')
    runOut(s)
    expect(s.flow.stage).toBe('complete')
    expect(store.load().completed).toEqual(['tutorial'])
  })

  it('paso adelante y atrás vuelven al mismo tick', () => {
    const s = session('tutorial')
    for (let i = 0; i < 10; i++) s.step()
    s.back()
    expect(s.playback.timeline.tick).toBe(9)
    expect(s.actions).toEqual(new Set(['step', 'back']))
  })
})

describe('GameSession · nivel 1 (Strategy)', () => {
  it('recorre el nivel completo: problema, patrones, cambio y comparación', () => {
    const store = new MemoryProgressStore()
    const s = session('strategy', store)
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
    expect(s.touched).toEqual(['charge'])
    s.finishLevel()
    expect(s.flow.stage).toBe('complete')
    expect(store.load()).toMatchObject({ completed: ['strategy'], notes: ['strategy:observer', 'strategy:strategy'] })
  })
})

describe('GameSession · detalles', () => {
  const inChoose = (id: string) => {
    const s = session(id)
    runOut(s)
    return s
  }

  it('con varios sockets, un patrón sin socket va al primero sin resolver que lo acepte', () => {
    const s = inChoose('branches-and-payments')
    const [first] = s.sockets
    const pattern = first.inventory.find((p) => first.options[p]?.outcome === 'solves')!
    s.plug(pattern)
    expect(s.flow.plugs[first.id]?.pattern).toBe(pattern)
    expect(s.pendingSockets.map((k) => k.id)).not.toContain(first.id)
    expect(s.accepts(pattern, first.id)).toBe(true)
  })

  it('un patrón en un socket que no lo acepta no hace nada', () => {
    const s = inChoose('strategy')
    expect(s.plug('strategy', 'no-existe')).toBeUndefined()
    expect(s.flow.plugs).toEqual({})
  })

  it('desenchufar vuelve al circuito sin patrón y no lo corre solo', () => {
    const s = inChoose('strategy')
    s.plug('strategy')
    const [socket] = s.sockets
    s.unplug(socket.id)
    expect(s.pluggedAt(socket.id)).toBeUndefined()
    expect(s.playback.playing).toBe(false)
  })

  it('conectar un nodo consigo mismo no cuenta como intento', () => {
    expect(session('tutorial').connect('charge', 'charge')).toBe('none')
  })

  it('reiniciar borra el resultado; reconstruir conserva velocidad y nodo inspeccionado', () => {
    const s = inChoose('strategy')
    expect(s.result).toBeDefined()
    s.setSpeed(2)
    s.inspect('charge')
    s.reset()
    expect(s.result).toBeUndefined()
    s.plug('strategy')
    expect(s.playback.speed).toBe(2)
    expect(s.playback.inspected).toBe('charge')
  })

  it('la calificación de la corrida coincide con evaluar la variante desde cero', () => {
    const s = inChoose('observer')
    s.plug('observer')
    runOut(s)
    expect(s.result).toEqual(evaluate(s.level, s.variant))
  })

  it('la comparación lista solo las métricas objetivo que cambian', () => {
    const s = session('strategy')
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
    const store = new MemoryProgressStore({ version: 1, completed: ['tutorial'], notes: ['strategy:observer'], predictions: { right: 1, total: 2 }, review: {} })
    const s = session('strategy', store)
    s.resetProgress()
    expect(store.load()).toEqual(emptyProgress())
  })
})

describe('GameSession · predicciones', () => {
  const inChoose = (id: string, store = new MemoryProgressStore()) => {
    const s = session(id, store)
    runOut(s)
    return s
  }

  it('enchufar abre una pregunta y no corre hasta responderla', () => {
    const store = new MemoryProgressStore()
    const s = inChoose('strategy', store)
    s.plug('observer')
    expect(s.awaitingPrediction).toBe(true)
    expect(s.playback.playing).toBe(false)
    s.predict('solves')
    expect(s.playback.playing).toBe(true)
    expect(s.prediction).toMatchObject({ guess: 'solves', answer: 'misfit' })
    expect(store.load().predictions).toEqual({ right: 0, total: 1 })
  })

  it('darle play sin responder omite la pregunta y no cuenta', () => {
    const store = new MemoryProgressStore()
    const s = inChoose('strategy', store)
    s.plug('strategy')
    s.play()
    expect(s.prediction).toBeUndefined()
    expect(store.load().predictions.total).toBe(0)
  })

  it('el ticket pregunta cuántas piezas se tocarán y responder lo aplica', () => {
    const s = inChoose('strategy')
    s.plug('strategy')
    s.predict('solves')
    runOut(s)
    s.continue()
    expect(s.prediction).toMatchObject({ kind: 'touched', answer: '0' })
    s.predict('0')
    expect(s.flow.ticketApplied).toBe(true)
    runOut(s)
    expect(s.touched).toEqual([])
  })
})

describe('GameSession · cambios en el código', () => {
  const toCompare = (id: string) => {
    const s = session(id)
    runOut(s)
    const solution = s.sockets.map((k) => k.inventory.find((p) => k.options[p]?.outcome === 'solves')!)
    for (const p of solution) s.plug(p)
    runOut(s)
    s.continue()
    if (s.flow.stage === 'change') {
      s.skipPrediction()
      runOut(s)
      s.continue()
    }
    return s
  }

  it('Strategy + ticket: con el patrón solo cambia el registro; sin patrón se abre Cashier', () => {
    const s = toCompare('strategy')
    const removed = () => s.codeChange!.lines.filter((l) => l.kind === 'del').map((l) => l.text.trim())
    expect(removed()).toEqual(['{ cash: CashPayment.new, card: CardPayment.new, voucher: VoucherPayment.new },'])
    s.showSide('without')
    const added = s.codeChange!.lines.filter((l) => l.kind === 'add').map((l) => l.text.trim())
    expect(added.some((l) => l.startsWith('elsif order.payment == :app'))).toBe(true) // una rama nueva dentro de Cashier
    expect(identity(s.codeChange!.title)).toContain('sin patrón')
  })

  it('sin ticket compara el código sin patrón con el código con patrón', () => {
    const s = toCompare('builder')
    expect(identity(s.codeChange!.title)).toContain('Builder')
    expect(s.codeChange!.added + s.codeChange!.removed).toBeGreaterThan(0)
  })

  it('antes de comparar no hay cambios que mostrar', () => {
    expect(session('strategy').codeChange).toBeUndefined()
  })
})

describe('GameSession · repaso', () => {
  it('anota la respuesta en el progreso guardado', () => {
    const store = new MemoryProgressStore()
    const s = session('tutorial', store)
    s.recordReview('strategy/metodo-de-pago', true, 1000)
    expect(store.load().review['strategy/metodo-de-pago']).toMatchObject({ box: 1 })
  })
})
