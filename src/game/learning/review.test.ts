import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../levels'
import { dueItems, recordAnswer, reviewItems, type ReviewState } from './review'

const DAY = 24 * 60 * 60 * 1000
const now = Date.UTC(2026, 8, 24)

describe('spaced review', () => {
  it('only sockets of completed levels get in, with the pattern that solves them', () => {
    const items = reviewItems(LEVELS, ['tutorial', 'strategy', 'branches-and-payments'])
    expect(items.map((i) => i.id)).toEqual(['strategy/payment-method', ...LEVELS.find((l) => l.id === 'branches-and-payments')!.sockets.map((s) => `branches-and-payments/${s.id}`)])
    expect(items[0].answer).toBe('strategy')
  })

  it('never-reviewed items are pending; correct ones get pushed further and further out', () => {
    const items = reviewItems(LEVELS, ['strategy'])
    let state: ReviewState = {}
    expect(dueItems(items, state, now)).toHaveLength(1)
    state = recordAnswer(state, 'strategy/payment-method', true, now)
    expect(state['strategy/payment-method']).toEqual({ box: 1, due: now + DAY })
    expect(dueItems(items, state, now)).toHaveLength(0)
    expect(dueItems(items, state, now + DAY)).toHaveLength(1)
    state = recordAnswer(state, 'strategy/payment-method', true, now + DAY)
    expect(state['strategy/payment-method']).toEqual({ box: 2, due: now + DAY + 3 * DAY })
  })

  it('a mistake sends the card back to the first box and it returns right away', () => {
    const state = recordAnswer({ x: { box: 4, due: 0 } }, 'x', false, now)
    expect(state.x).toEqual({ box: 1, due: now })
  })

  it('the box does not go past the last one', () => {
    const state = recordAnswer({ x: { box: 5, due: 0 } }, 'x', true, now)
    expect(state.x).toEqual({ box: 5, due: now + 30 * DAY })
  })
})
