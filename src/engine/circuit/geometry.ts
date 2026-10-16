// Geometry shared by the engine (wire length) and the render (drawing).
// Unit: one grid cell.
export type Point = { x: number; y: number }

// Orthogonal route in the Mini Metro style: horizontal, vertical at the midpoint, horizontal.
export function wirePath(from: [number, number], to: [number, number]): Point[] {
  const a = { x: from[0], y: from[1] }
  const b = { x: to[0], y: to[1] }
  if (a.y === b.y || a.x === b.x) return [a, b]
  const midX = (a.x + b.x) / 2
  return [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b]
}

export function pathLength(points: Point[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    len += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y)
  }
  return len
}

export function pointAt(points: Point[], progress: number): Point {
  const total = pathLength(points)
  let remaining = Math.min(Math.max(progress, 0), 1) * total
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const seg = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    if (remaining <= seg && seg > 0) {
      const f = remaining / seg
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }
    }
    remaining -= seg
  }
  return points[points.length - 1]
}
