import { useEffect, useRef } from 'react'

// Accessible modal dialog: focus enters on open, Escape closes and focus returns to whoever opened it.
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const first = useRef<T>(null)
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    first.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [onClose])
  return first
}
