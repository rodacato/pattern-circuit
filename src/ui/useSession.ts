import { useSyncExternalStore } from 'react'
import type { GameSession } from '../game/session/GameSession'

// The selector must return primitives or stable references: it only re-renders if it changes.
export function useSession<T>(session: GameSession, select: (s: GameSession) => T): T {
  return useSyncExternalStore(session.subscribe, () => select(session))
}
