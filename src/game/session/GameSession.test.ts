import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import { createTranslator } from '../../i18n'
import { APP_CATALOGS } from '../../i18n/registry'
import { LEVELS } from '../../levels'
import { emptyProgress, MemoryProgressStore } from '../progress/progress'
import { GameSession } from './GameSession'

const es = createTranslator([APP_CATALOGS['es-MX']])

const session = (id: string, store = new MemoryProgressStore()) => new GameSession(LEVELS.find((l) => l.id === id)!, store)

const runOut = (s: GameSession) => {
  if (!s.playback.playing) s.play()
  for (let i = 0; i < 10_000 && s.playback.playing; i++) s.update(1)
}

describe('GameSession · level 0', () => {
  it('without repairing it is lost; with the right wire it completes and is saved', () => {
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

  it('stepping forward and back returns to the same tick', () => {
    const s = session('tutorial')
    for (let i = 0; i < 10; i++) s.step()
    s.back()
    expect(s.playback.timeline.tick).toBe(9)
    expect(s.actions).toEqual(new Set(['step', 'back']))
  })
})

describe('GameSession · level 1 (Strategy)', () => {
  it('goes through the whole level: problem, patterns, change and comparison', () => {
    const store = new MemoryProgressStore()
    const s = session('strategy', store)
    expect(s.plug('strategy')).toBeUndefined() // the inventory opens after seeing the problem

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

describe('GameSession · details', () => {
  const inChoose = (id: string) => {
    const s = session(id)
    runOut(s)
    return s
  }

  it('with several sockets, a pattern without a socket goes to the first unresolved one that accepts it', () => {
    const s = inChoose('branches-and-payments')
    const [first] = s.sockets
    const pattern = first.inventory.find((p) => first.options[p]?.outcome === 'solves')!
    s.plug(pattern)
    expect(s.flow.plugs[first.id]?.pattern).toBe(pattern)
    expect(s.pendingSockets.map((k) => k.id)).not.toContain(first.id)
    expect(s.accepts(pattern, first.id)).toBe(true)
  })

  it('a pattern in a socket that does not accept it does nothing', () => {
    const s = inChoose('strategy')
    expect(s.plug('strategy', 'no-existe')).toBeUndefined()
    expect(s.flow.plugs).toEqual({})
  })

  it('unplugging goes back to the circuit without a pattern and does not run it on its own', () => {
    const s = inChoose('strategy')
    s.plug('strategy')
    const [socket] = s.sockets
    s.unplug(socket.id)
    expect(s.pluggedAt(socket.id)).toBeUndefined()
    expect(s.playback.playing).toBe(false)
  })

  it('connecting a node to itself does not count as an attempt', () => {
    expect(session('tutorial').connect('charge', 'charge')).toBe('none')
  })

  it('restarting clears the result; rebuilding keeps speed and inspected node', () => {
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

  it('the run score matches evaluating the variant from scratch', () => {
    const s = inChoose('observer')
    s.plug('observer')
    runOut(s)
    expect(s.result).toEqual(evaluate(s.level, s.variant))
  })

  it('the comparison lists only the goal metrics that change', () => {
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

  it('clearing progress empties it in the store', () => {
    const store = new MemoryProgressStore({ version: 1, completed: ['tutorial'], notes: ['strategy:observer'], predictions: { right: 1, total: 2 }, review: {} })
    const s = session('strategy', store)
    s.resetProgress()
    expect(store.load()).toEqual(emptyProgress())
  })
})

describe('GameSession · predictions', () => {
  const inChoose = (id: string, store = new MemoryProgressStore()) => {
    const s = session(id, store)
    runOut(s)
    return s
  }

  it('plugging opens a question and does not run until it is answered', () => {
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

  it('the circuit and the code keep their old shape until the question is answered, so they do not give it away', () => {
    const s = inChoose('strategy')
    const nodes = s.playback.circuit.nodes.size
    const code = s.codeFile.text
    s.plug('strategy')
    expect(s.playback.circuit.nodes.size).toBe(nodes)
    expect(s.codeFile.text).toBe(code)
    s.predict('solves')
    expect(s.playback.circuit.nodes.size).toBeGreaterThan(nodes)
    expect(s.codeFile.text).not.toBe(code)
  })

  it('pressing play without answering skips the question, does not count, and runs the plugged circuit', () => {
    const store = new MemoryProgressStore()
    const s = inChoose('strategy', store)
    const nodes = s.playback.circuit.nodes.size
    s.plug('strategy')
    s.play()
    expect(s.prediction).toBeUndefined()
    expect(store.load().predictions.total).toBe(0)
    expect(s.playback.playing).toBe(true)
    expect(s.playback.circuit.nodes.size).toBeGreaterThan(nodes)
  })

  it('the ticket asks how many pieces will be touched and answering applies it', () => {
    const s = inChoose('strategy')
    s.plug('strategy')
    s.predict('solves')
    runOut(s)
    s.continue()
    expect(s.prediction).toMatchObject({ kind: 'touched', answer: '0' })
    s.predict('0')
    expect(s.flow.ticket).not.toBe('open')
    runOut(s)
    expect(s.touched).toEqual([])
  })
})

describe('GameSession · code changes', () => {
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

  it('Strategy + ticket: with the pattern only the registration changes; without it Cashier is opened', () => {
    const s = toCompare('strategy')
    const removed = () => s.codeChange!.lines.filter((l) => l.kind === 'del').map((l) => l.text.trim())
    expect(removed()).toEqual(['{ cash: CashPayment.new, card: CardPayment.new, voucher: VoucherPayment.new },'])
    s.showSide('without')
    const added = s.codeChange!.lines.filter((l) => l.kind === 'add').map((l) => l.text.trim())
    expect(added.some((l) => l.startsWith('elsif order.payment == :app'))).toBe(true) // a new branch inside Cashier
    expect(es(s.codeChange!.title)).toContain('sin patrón')
  })

  it('without a ticket it compares the code without pattern against the code with pattern', () => {
    const s = toCompare('builder')
    expect(es(s.codeChange!.title)).toContain('Builder')
    expect(s.codeChange!.added + s.codeChange!.removed).toBeGreaterThan(0)
  })

  it('before comparing there are no changes to show', () => {
    expect(session('strategy').codeChange).toBeUndefined()
  })
})

describe('GameSession · review', () => {
  it('records the answer in the saved progress', () => {
    const store = new MemoryProgressStore()
    const s = session('tutorial', store)
    s.recordReview('strategy/payment-method', true, 1000)
    expect(store.load().review['strategy/payment-method']).toMatchObject({ box: 1 })
  })
})

describe('events for the host of the course', () => {
  it('tells the unit that was opened and, once, the unit that was completed', () => {
    const heard: string[] = []
    const s = new GameSession(LEVELS.find((l) => l.id === 'tutorial')!, new MemoryProgressStore(), { started: (id) => heard.push(`started ${id}`), completed: (id) => heard.push(`completed ${id}`) })
    expect(heard).toEqual(['started tutorial'])
    runOut(s)
    expect(heard).toEqual(['started tutorial'])
    s.connect('prepare', 'handOver')
    runOut(s)
    expect(heard).toEqual(['started tutorial', 'completed tutorial'])
    s.reset()
    runOut(s)
    expect(heard.filter((h) => h.startsWith('completed'))).toHaveLength(1)
  })
})
