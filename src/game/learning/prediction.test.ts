import { describe, expect, it } from 'vitest'
import { identity } from '../../i18n'
import { choiceLabel, guessed, isRight, outcomePrediction, touchedPrediction } from './prediction'

describe('predictions', () => {
  it('the answer of an outcome prediction is the outcome of the option', () => {
    const p = outcomePrediction('Strategy', 'partial')
    expect(p.answer).toBe('partial')
    expect(identity(p.question)).toContain('Strategy')
    expect(isRight(p)).toBe(false)
    expect(isRight(guessed(p, 'partial'))).toBe(true)
    expect(isRight(guessed(p, 'solves'))).toBe(false)
  })

  it('touched nodes are grouped as none, one or more than one', () => {
    expect([0, 1, 2, 5].map((n) => touchedPrediction(n).answer)).toEqual(['0', '1', 'many', 'many'])
  })

  it('choiceLabel translates the id into its text', () => {
    expect(choiceLabel(touchedPrediction(0), '0')).toContain('Ninguna')
  })
})
