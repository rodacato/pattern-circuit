import { createContext, useContext } from 'react'
import type { Mode } from './code/highlight'

// Light or dark, as the host asked: it decides the code colors; the circuit stage is dark either way.
export const ModeContext = createContext<Mode>('dark')
export const useMode = () => useContext(ModeContext)
