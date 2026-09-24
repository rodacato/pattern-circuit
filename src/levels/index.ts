import type { Level } from '../engine'

// Agregar un nivel = crear su carpeta; el registro los descubre y ordena solo.
const modules = import.meta.glob<{ default: Level }>('./*/level.ts', { eager: true })

export const LEVELS: Level[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

export { chapterName, CHAPTERS } from './chapters'
