import { useEffect, useRef } from 'react'

// Diálogo modal accesible: el foco entra al abrir, Escape cierra y el foco vuelve a quien lo abrió.
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
