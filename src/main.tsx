import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DebugApp from './debug/DebugApp.tsx'
import GameApp from './ui/GameApp.tsx'

const debug = new URLSearchParams(location.search).has('debug')

createRoot(document.getElementById('root')!).render(<StrictMode>{debug ? <DebugApp /> : <GameApp />}</StrictMode>)
