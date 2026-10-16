import type { Catalog } from '../..'
import { cards } from './cards'
import { game } from './game'
import { patterns } from './patterns'
import { render } from './render'
import { ui } from './ui'

// English is the source of the typed keys (see AppKey).
export const SOURCE = { ...ui, ...cards, ...render, ...game, ...patterns } as const
export type AppKey = keyof typeof SOURCE

export default SOURCE as Catalog
