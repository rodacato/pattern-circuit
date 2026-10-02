import { describe, expect, it } from 'vitest'
import { LEVELS } from '../../levels'
import { dueItems, recordAnswer, reviewItems, type ReviewState } from './review'

const DAY = 24 * 60 * 60 * 1000
const now = Date.UTC(2026, 8, 24)

describe('repaso espaciado', () => {
  it('solo entran los sockets de niveles completados, con el patrón que resuelve', () => {
    const items = reviewItems(LEVELS, ['tutorial', 'strategy', 'branches-and-payments'])
    expect(items.map((i) => i.id)).toEqual(['strategy/metodo-de-pago', ...LEVELS.find((l) => l.id === 'branches-and-payments')!.sockets.map((s) => `branches-and-payments/${s.id}`)])
    expect(items[0].answer).toBe('strategy')
  })

  it('lo nunca repasado está pendiente; lo acertado se aleja cada vez más', () => {
    const items = reviewItems(LEVELS, ['strategy'])
    let state: ReviewState = {}
    expect(dueItems(items, state, now)).toHaveLength(1)
    state = recordAnswer(state, 'strategy/metodo-de-pago', true, now)
    expect(state['strategy/metodo-de-pago']).toEqual({ box: 1, due: now + DAY })
    expect(dueItems(items, state, now)).toHaveLength(0)
    expect(dueItems(items, state, now + DAY)).toHaveLength(1)
    state = recordAnswer(state, 'strategy/metodo-de-pago', true, now + DAY)
    expect(state['strategy/metodo-de-pago']).toEqual({ box: 2, due: now + DAY + 3 * DAY })
  })

  it('un error devuelve la tarjeta a la primera caja y vuelve enseguida', () => {
    const state = recordAnswer({ x: { box: 4, due: 0 } }, 'x', false, now)
    expect(state.x).toEqual({ box: 1, due: now })
  })

  it('la caja no pasa de la última', () => {
    const state = recordAnswer({ x: { box: 5, due: 0 } }, 'x', true, now)
    expect(state.x).toEqual({ box: 5, due: now + 30 * DAY })
  })
})
