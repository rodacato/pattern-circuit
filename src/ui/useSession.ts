import { useSyncExternalStore } from 'react'
import type { GameSession } from '../game/session/GameSession'

// El selector debe devolver primitivos o referencias estables: solo re-renderiza si cambia.
export function useSession<T>(session: GameSession, select: (s: GameSession) => T): T {
  return useSyncExternalStore(session.subscribe, () => select(session))
}
