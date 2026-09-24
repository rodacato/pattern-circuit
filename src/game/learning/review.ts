import type { LevelDef, PatternId, SocketDef } from '../../engine'

// Repaso espaciado (sistema Leitner): cada acierto sube la tarjeta de caja y la aleja en el tiempo;
// un error la devuelve a la primera caja. Una tarjeta = un socket de un nivel ya completado.
export type ReviewState = Record<string, { box: number; due: number }>

const DAY = 24 * 60 * 60 * 1000
export const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30] // espera tras acertar, según la caja a la que sube (1..5)
export const ROUND_SIZE = 5

export type ReviewItem = {
  id: string
  level: Pick<LevelDef, 'id' | 'order' | 'title' | 'brief'>
  socket: SocketDef
  answer: PatternId
  multiSocket: boolean // con varios sockets, la pregunta dice de cuál se trata
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

// Pendientes: las nunca repasadas y las vencidas, las más atrasadas primero.
export function dueItems(items: ReviewItem[], state: ReviewState, now: number): ReviewItem[] {
  const dueAt = (i: ReviewItem) => state[i.id]?.due ?? 0
  return items.filter((i) => dueAt(i) <= now).sort((a, b) => dueAt(a) - dueAt(b) || a.level.order - b.level.order)
}

export function recordAnswer(state: ReviewState, id: string, correct: boolean, now: number): ReviewState {
  const box = correct ? Math.min((state[id]?.box ?? 0) + 1, BOX_INTERVAL_DAYS.length) : 1
  // Un error vuelve a aparecer en la próxima ronda; un acierto espera el intervalo de su nueva caja.
  const due = correct ? now + BOX_INTERVAL_DAYS[box - 1] * DAY : now
  return { ...state, [id]: { box, due } }
}
