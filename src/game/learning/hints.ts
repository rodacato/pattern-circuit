import { FAMILY_NAMES, PATTERNS, type Evaluation, type LevelDef, type MetricName, type PatternFamily } from '../../engine'
import { msg, N, type Message } from '../../i18n'
import type { AppKey } from '../../i18n/keys'
import { pendingSockets, type FlowState } from '../flow/levelFlow'

// Hints from least to most: a guiding question, the pattern family, a ruling out and, at the end, the answer.
// Everything comes from the level data; the GoF family definitions are the book's (Gamma et al., 1994, ch. 1).

// Guiding questions per symptom: they direct the eye without naming any pattern.
const QUESTIONS: Partial<Record<MetricName, AppKey>> = {
  dropped: N('game.hints.question.dropped'),
  invalidAtSink: N('game.hints.question.invalidAtSink'),
  duplicatesAtSink: N('game.hints.question.duplicatesAtSink'),
  nodesTouched: N('game.hints.question.nodesTouched'),
  nodes: N('game.hints.question.nodes'),
  maxLoad: N('game.hints.question.maxLoad'),
  cancelled: N('game.hints.question.cancelled'),
  delivered: N('game.hints.question.delivered'),
}

const FAMILY_HINT: Record<PatternFamily, AppKey> = {
  creational: N('game.hints.familyDetail.creational'),
  structural: N('game.hints.familyDetail.structural'),
  behavioral: N('game.hints.familyDetail.behavioral'),
  architecture: N('game.hints.familyDetail.architecture'),
  resilience: N('game.hints.familyDetail.resilience'),
  principle: N('game.hints.familyDetail.principle'),
}

type HintLevel = Pick<LevelDef, 'sockets' | 'changeTickets'>

export function hintLadder(level: HintLevel, flow: FlowState, result?: Evaluation): Message[] {
  const socket = pendingSockets(level, flow)[0]
  if (!socket) return []
  const answer = socket.inventory.find((p) => socket.options[p]?.outcome === 'solves')
  if (!answer) return []
  // "Delivered" is the most general symptom: if another metric fails, that one guides better.
  const failing = result?.results.filter((r) => !r.pass).map((r) => r.assertion.metric).sort((a, b) => Number(a === 'delivered') - Number(b === 'delivered'))[0]
  const decoy = socket.inventory.find((p) => socket.options[p]?.outcome === 'misfit' && flow.plugs[socket.id]?.pattern !== p)
  const family = PATTERNS[answer].family
  // With several sockets, each hint says which one it is about.
  const where = level.sockets.length > 1 ? msg('game.hints.socketSuffix', { socket: socket.label }) : ''
  return [
    (failing && QUESTIONS[failing]) ?? N('game.hints.question.fallback'),
    family === 'principle' ? msg('game.hints.principle', { where }) : msg('game.hints.family', { where, family: FAMILY_NAMES[family], detail: FAMILY_HINT[family] }),
    ...(decoy ? [msg('game.hints.ruleOut', { pattern: PATTERNS[decoy].name, where })] : []),
    msg('game.hints.answer', { pattern: PATTERNS[answer].name, where }),
  ]
}
