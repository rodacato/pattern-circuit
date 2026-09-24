import type { GameSession } from '../game/session/GameSession'

// Atajos de reproducción. Se ignoran con un modificador (⌘R recarga) o si el foco está en un control que ya usa la tecla.
export const SHORTCUTS: Record<string, (s: GameSession) => void> = {
  ' ': (s) => s.toggle(),
  ArrowRight: (s) => s.step(),
  ArrowLeft: (s) => s.back(),
  r: (s) => s.reset(),
}

export function isShortcut(e: Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey' | 'target'>) {
  if (e.metaKey || e.ctrlKey || e.altKey) return false
  const t = e.target
  return !(t instanceof HTMLButtonElement || t instanceof HTMLSelectElement || t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)
}
