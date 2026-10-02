import type { GameSession } from '../game/session/GameSession'

// Playback shortcuts. Ignored with a modifier (⌘R reloads) or if focus is in a control that already uses the key.
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
