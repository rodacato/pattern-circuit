import type { Catalog } from '../..'
import { cards } from './cards'
import { game } from './game'
import { patterns } from './patterns'
import { render } from './render'
import { ui } from './ui'

export default { ...ui, ...cards, ...render, ...game, ...patterns } as Catalog
