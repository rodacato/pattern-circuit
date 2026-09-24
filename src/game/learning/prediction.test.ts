import { describe, expect, it } from 'vitest'
import { identity } from '../../i18n'
import { choiceLabel, guessed, isRight, outcomePrediction, touchedPrediction } from './prediction'

describe('predicciones', () => {
  it('la respuesta de una predicción de resultado es el resultado de la opción', () => {
    const p = outcomePrediction('Strategy', 'partial')
    expect(p.answer).toBe('partial')
    expect(identity(p.question)).toContain('Strategy')
    expect(isRight(p)).toBe(false)
    expect(isRight(guessed(p, 'partial'))).toBe(true)
    expect(isRight(guessed(p, 'solves'))).toBe(false)
  })

  it('los nodos tocados se agrupan en ninguna, una o más de una', () => {
    expect([0, 1, 2, 5].map((n) => touchedPrediction(n).answer)).toEqual(['0', '1', 'many', 'many'])
  })

  it('choiceLabel traduce el id a su texto', () => {
    expect(choiceLabel(touchedPrediction(0), '0')).toContain('Ninguna')
  })
})
