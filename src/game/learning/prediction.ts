import type { SocketOption } from '../../engine'

// Predecir antes de ver: el jugador se compromete con una respuesta y el circuito la confirma o la contradice.
// Las preguntas salen de los datos del nivel (resultado de la opción, nodos tocados): no hay contenido extra que inventar.
export type PredictionKind = 'outcome' | 'touched'
export type Choice = { id: string; label: string }

export type Prediction = {
  kind: PredictionKind
  question: string
  choices: Choice[]
  answer: string
  guess?: string
}

const OUTCOME_CHOICES: Choice[] = [
  { id: 'solves', label: 'Resuelve el problema' },
  { id: 'partial', label: 'Lo resuelve a medias' },
  { id: 'misfit', label: 'No encaja aquí' },
]

const TOUCHED_CHOICES: Choice[] = [
  { id: '0', label: 'Ninguna: solo se agrega algo nuevo' },
  { id: '1', label: 'Una' },
  { id: 'many', label: 'Más de una' },
]

export const outcomePrediction = (patternName: string, outcome: SocketOption['outcome']): Prediction => ({
  kind: 'outcome',
  question: `Antes de correrlo: ¿qué hará ${patternName} en este socket?`,
  choices: OUTCOME_CHOICES,
  answer: outcome,
})

export const touchedPrediction = (touched: number): Prediction => ({
  kind: 'touched',
  question: '¿Cuántas piezas que ya funcionaban habrá que modificar para cumplir el ticket?',
  choices: TOUCHED_CHOICES,
  answer: touched === 0 ? '0' : touched === 1 ? '1' : 'many',
})

export const guessed = (p: Prediction, guess: string): Prediction => ({ ...p, guess })
export const isRight = (p: Prediction) => p.guess !== undefined && p.guess === p.answer
export const choiceLabel = (p: Prediction, id: string | undefined) => p.choices.find((c) => c.id === id)?.label ?? id
