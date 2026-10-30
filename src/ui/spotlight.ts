export type Box = { left: number; top: number; width: number; height: number }
type Size = { width: number; height: number }

const GAP = 16

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

type Point = { left: number; top: number }

// Next to the target where it fits whole, so the card never covers what it explains: above or below
// a wide target, beside a tall one. Inside its bottom-right corner when the target fills the screen.
export function placeCard(target: Box, card: Size, viewport: Size): Point {
  const fits = (space: number, size: number) => space >= size + 2 * GAP
  const alongY = clamp(target.top + (target.height - card.height) / 2, GAP, viewport.height - card.height - GAP)
  const alongX = clamp(target.left + (target.width - card.width) / 2, GAP, viewport.width - card.width - GAP)
  const right = viewport.width - (target.left + target.width)
  const below = viewport.height - (target.top + target.height)

  const beside: (Point | undefined)[] = [
    fits(right, card.width) ? { left: target.left + target.width + GAP, top: alongY } : undefined,
    fits(target.left, card.width) ? { left: target.left - card.width - GAP, top: alongY } : undefined,
  ]
  const across: (Point | undefined)[] = [
    fits(target.top, card.height) ? { left: alongX, top: target.top - card.height - GAP } : undefined,
    fits(below, card.height) ? { left: alongX, top: target.top + target.height + GAP } : undefined,
  ]
  const spot = (target.width > target.height ? [...across, ...beside] : [...beside, ...across]).find(Boolean)
  if (spot) return spot
  return {
    left: clamp(target.left + target.width - card.width - GAP, GAP, viewport.width - card.width - GAP),
    top: clamp(target.top + target.height - card.height - GAP, GAP, viewport.height - card.height - GAP),
  }
}
