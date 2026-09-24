import type { SocketOption } from '../../engine'
import { msg, N, type Message } from '../../i18n'

// Predecir antes de ver: el jugador se compromete con una respuesta y el circuito la confirma o la contradice.
// Las preguntas salen de los datos del nivel (resultado de la opción, nodos tocados): no hay contenido extra que inventar.
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
  { id: 'solves', label: N('Resuelve el problema') },
  { id: 'partial', label: N('Lo resuelve a medias') },
  { id: 'misfit', label: N('No encaja aquí') },
]

const TOUCHED_CHOICES: Choice[] = [
  { id: '0', label: N('Ninguna: solo se agrega algo nuevo') },
  { id: '1', label: N('Una') },
  { id: 'many', label: N('Más de una') },
]

export const outcomePrediction = (patternName: string, outcome: SocketOption['outcome']): Prediction => ({
  kind: 'outcome',
  question: msg('Antes de correrlo: ¿qué hará {pattern} en este socket?', { pattern: patternName }),
  choices: OUTCOME_CHOICES,
  answer: outcome,
})

export const touchedPrediction = (touched: number): Prediction => ({
  kind: 'touched',
  question: N('¿Cuántas piezas que ya funcionaban habrá que modificar para cumplir el ticket?'),
  choices: TOUCHED_CHOICES,
  answer: touched === 0 ? '0' : touched === 1 ? '1' : 'many',
})

export const guessed = (p: Prediction, guess: string): Prediction => ({ ...p, guess })
export const isRight = (p: Prediction) => p.guess !== undefined && p.guess === p.answer
export const choiceLabel = (p: Prediction, id: string | undefined) => p.choices.find((c) => c.id === id)?.label ?? id
