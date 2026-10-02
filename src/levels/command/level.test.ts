import { describe, expect, it } from 'vitest'
import { evaluate } from '../../engine'
import level from './level'

const socket = (pattern: 'command' | 'strategy' | 'observer') => ({ sockets: [{ id: 'pedidos', pattern }] })

describe('L13 · Command', () => {
  it('sin patrón: el latte se prepara igual y la cancelación se pierde', () => {
    expect(evaluate(level, {}).metrics).toMatchObject({ delivered: 3, dropped: 1, cancelled: 0 })
  })

  it('Command: la cancelación saca el latte de la cola antes de prepararlo', () => {
    expect(evaluate(level, socket('command')).metrics).toMatchObject({ delivered: 2, cancelled: 1, dropped: 0 })
  })

  it('Observer prepara la cancelación como si fuera un pedido', () => {
    expect(evaluate(level, socket('observer')).metrics.delivered).toBe(4)
  })
})
