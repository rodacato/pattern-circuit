import type { SocketOption } from '../../engine'
import { msg, N, type Message } from '../../i18n'

// Predict before seeing: the player commits to an answer and the circuit confirms or contradicts it.
// The questions come from the level data (option result, touched nodes): there is no extra content to invent.
export type PredictionKind = 'outcome' | 'touched'
export type Choice = { id: string; label: string }

export type Prediction = {
  kind: PredictionKind
  question: Message
  choices: Choice[]
  answer: string
  guess?: string
}

const OUTCOME_CHOICES: Choice[] = [
  { id: 'solves', label: N('game.prediction.outcome.solves') },
  { id: 'partial', label: N('game.prediction.outcome.partial') },
  { id: 'misfit', label: N('game.prediction.outcome.misfit') },
]

const TOUCHED_CHOICES: Choice[] = [
  { id: '0', label: N('game.prediction.touched.none') },
  { id: '1', label: N('game.prediction.touched.one') },
  { id: 'many', label: N('game.prediction.touched.many') },
]

export const outcomePrediction = (patternName: string, outcome: SocketOption['outcome']): Prediction => ({
  kind: 'outcome',
  question: msg('game.prediction.outcomeQuestion', { pattern: patternName }),
  choices: OUTCOME_CHOICES,
  answer: outcome,
})

export const touchedPrediction = (touched: number): Prediction => ({
  kind: 'touched',
  question: N('game.prediction.touchedQuestion'),
  choices: TOUCHED_CHOICES,
  answer: touched === 0 ? '0' : touched === 1 ? '1' : 'many',
})

export const guessed = (p: Prediction, guess: string): Prediction => ({ ...p, guess })
export const isRight = (p: Prediction) => p.guess !== undefined && p.guess === p.answer
export const choiceLabel = (p: Prediction, id: string | undefined) => p.choices.find((c) => c.id === id)?.label ?? id
