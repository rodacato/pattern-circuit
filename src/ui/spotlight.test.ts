import { describe, expect, it } from 'vitest'
import { placeCard, type Box } from './spotlight'

const CARD = { width: 400, height: 260 }
const VIEWPORT = { width: 1672, height: 1037 }
const STAGE = { left: 0, top: 56, width: 1232, height: 981 }
const CODE = { left: 1232, top: 56, width: 440, height: 981 }
const TRANSPORT = { left: 388, top: 953, width: 456, height: 62 }

const overlaps = (a: Box, b: Box) => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height
const cardAt = (target: Box, viewport = VIEWPORT) => ({ ...placeCard(target, CARD, viewport), ...CARD })
const inside = (card: Box, viewport: { width: number; height: number }) =>
  card.left >= 0 && card.top >= 0 && card.left + card.width <= viewport.width && card.top + card.height <= viewport.height

describe('placing the guide card next to what it explains', () => {
  it.each([
    ['the circuit', STAGE],
    ['the code panel', CODE],
    ['the playback bar', TRANSPORT],
  ])('does not cover %s', (_, target) => {
    const card = cardAt(target)
    expect(overlaps(card, target)).toBe(false)
    expect(inside(card, VIEWPORT)).toBe(true)
  })

  it('goes above a wide, flat bar rather than beside it', () => {
    expect(cardAt(TRANSPORT).top + CARD.height).toBeLessThanOrEqual(TRANSPORT.top)
  })

  it('stays on screen, inside the target, when nothing around it has room', () => {
    const viewport = { width: 1280, height: 720 }
    const everything = { left: 0, top: 0, width: 1280, height: 720 }
    expect(inside(cardAt(everything, viewport), viewport)).toBe(true)
  })
})
