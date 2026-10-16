import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyProgress } from '../game/progress/progress'
import { fromHostProgress, HostProgressStore, toHostProgress } from './hostProgress'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('progress given by the host', () => {
  it('turns completed units and the opaque state back into the course progress, and back again', () => {
    const progress = { ...emptyProgress(), completed: ['strategy'], notes: ['strategy:observer'], predictions: { right: 2, total: 3 }, review: { 'strategy/payment-method': { box: 2, due: 5 } } }
    expect(fromHostProgress(toHostProgress(progress))).toEqual(progress)
  })

  it('starts empty without progress and survives a state it does not understand', () => {
    expect(fromHostProgress(null)).toEqual(emptyProgress())
    expect(fromHostProgress({ completedUnits: ['saga'], state: 'garbage' }).completed).toEqual(['saga'])
    expect(fromHostProgress({ completedUnits: ['saga'], state: { notes: 7 } }).completed).toEqual(['saga'])
  })
})

describe('HostProgressStore', () => {
  it('loads what the host gave, reports changes debounced with a growing revision, and flushes on demand', () => {
    const reported: [number, string[]][] = []
    const store = new HostProgressStore({ completedUnits: ['tutorial'] }, (rev, p) => reported.push([rev, p.completedUnits]))
    expect(store.load().completed).toEqual(['tutorial'])
    store.save({ ...store.load(), completed: ['tutorial', 'strategy'] })
    store.save({ ...store.load(), completed: ['tutorial', 'strategy', 'builder'] })
    vi.advanceTimersByTime(499)
    expect(reported).toEqual([])
    vi.advanceTimersByTime(1)
    expect(reported).toEqual([[1, ['tutorial', 'strategy', 'builder']]])
    store.save({ ...store.load(), notes: ['a:b'] })
    store.flush()
    store.flush()
    expect(reported.map(([rev]) => rev)).toEqual([1, 2])
  })

  it('a replacement from the host cancels what was waiting to be reported', () => {
    const reported: number[] = []
    const store = new HostProgressStore(null, (rev) => reported.push(rev))
    store.save({ ...emptyProgress(), completed: ['x'] })
    store.replace({ completedUnits: ['merged'] })
    vi.advanceTimersByTime(1000)
    expect(reported).toEqual([])
    expect(store.load().completed).toEqual(['merged'])
  })
})
