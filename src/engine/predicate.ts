import type { Predicate } from './schema'
import type { Pulse } from './types'

export function matches(p: Predicate, pulse: Pulse): boolean {
  if ('hasTag' in p) return pulse.tags.includes(p.hasTag)
  if ('shape' in p) return pulse.shape === p.shape
  if ('field' in p) return pulse.data[p.field] === p.eq
  if ('not' in p) return !matches(p.not, pulse)
  if ('all' in p) return p.all.every((q) => matches(q, pulse))
  return p.any.some((q) => matches(q, pulse))
}
