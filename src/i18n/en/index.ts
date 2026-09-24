import type { Catalog } from '..'
import { GAME } from './game'
import { PATTERNS_EN } from './patterns'
import { UI } from './ui'

// Catálogo inglés de todo lo que no es contenido de un nivel (cada nivel trae su propio `en.ts`).
export const EN: Catalog = { ...UI, ...GAME, ...PATTERNS_EN }
