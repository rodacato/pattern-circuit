import type { LevelDef, PatternId, SocketDef } from '../../engine'

// Spaced review (Leitner system): each correct answer moves the card up a box and pushes it further out in time;
// a mistake sends it back to the first box. One card = one socket of an already completed level.
export type ReviewState = Record<string, { box: number; due: number }>

const DAY = 24 * 60 * 60 * 1000
export const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30] // wait after a correct answer, by the box it moves up to (1..5)
export const ROUND_SIZE = 5

export type ReviewItem = {
  id: string
  level: Pick<LevelDef, 'id' | 'order' | 'title' | 'brief'>
  socket: SocketDef
  answer: PatternId
  multiSocket: boolean // with several sockets, the question says which one it is about
}

type ReviewLevel = Pick<LevelDef, 'id' | 'order' | 'title' | 'brief' | 'sockets'>

export function reviewItems(levels: ReviewLevel[], completed: string[]): ReviewItem[] {
  return levels
    .filter((l) => completed.includes(l.id))
    .flatMap((level) =>
      level.sockets.flatMap((socket) => {
        const answer = socket.inventory.find((p) => socket.options[p]?.outcome === 'solves')
        return answer ? [{ id: `${level.id}/${socket.id}`, level, socket, answer, multiSocket: level.sockets.length > 1 }] : []
      }),
    )
}

// Pending: never reviewed and overdue ones, the most overdue first.
export function dueItems(items: ReviewItem[], state: ReviewState, now: number): ReviewItem[] {
  const dueAt = (i: ReviewItem) => state[i.id]?.due ?? 0
  return items.filter((i) => dueAt(i) <= now).sort((a, b) => dueAt(a) - dueAt(b) || a.level.order - b.level.order)
}

export function recordAnswer(state: ReviewState, id: string, correct: boolean, now: number): ReviewState {
  const box = correct ? Math.min((state[id]?.box ?? 0) + 1, BOX_INTERVAL_DAYS.length) : 1
  // A mistake shows up again in the next round; a correct answer waits the interval of its new box.
  const due = correct ? now + BOX_INTERVAL_DAYS[box - 1] * DAY : now
  return { ...state, [id]: { box, due } }
}
