import type { PatternId } from './schema'
import { SEEN_IN } from './seenIn'

export type PatternFamily = 'creational' | 'structural' | 'behavioral' | 'architecture' | 'resilience' | 'principle'

// Where it appears in the Ruby ecosystem: a real example, with the source that shows it.
export type SeenIn = { example: string; text: string; url: string }

export type PatternInfo = { name: string; family: PatternFamily; gist: string; seenIn?: SeenIn }

// Pattern catalog: visible name, family and the idea in one sentence.
// `name`, `gist` and the family names are catalog keys (the engine does not import i18n): whoever shows them translates them.
// GoF families per Gamma et al. (1994); Null Object is "object structural" per Woolf (1997).
// The sources for each pattern are in docs/DESIGN.md.
const CATALOG: Record<PatternId, Omit<PatternInfo, 'seenIn'>> = {
  'factory-method': { name: 'pattern.factoryMethod.name', family: 'creational', gist: 'pattern.factoryMethod.gist' },
  builder: { name: 'pattern.builder.name', family: 'creational', gist: 'pattern.builder.gist' },
  singleton: { name: 'pattern.singleton.name', family: 'creational', gist: 'pattern.singleton.gist' },
  adapter: { name: 'pattern.adapter.name', family: 'structural', gist: 'pattern.adapter.gist' },
  decorator: { name: 'pattern.decorator.name', family: 'structural', gist: 'pattern.decorator.gist' },
  proxy: { name: 'pattern.proxy.name', family: 'structural', gist: 'pattern.proxy.gist' },
  composite: { name: 'pattern.composite.name', family: 'structural', gist: 'pattern.composite.gist' },
  facade: { name: 'pattern.facade.name', family: 'structural', gist: 'pattern.facade.gist' },
  strategy: { name: 'pattern.strategy.name', family: 'behavioral', gist: 'pattern.strategy.gist' },
  observer: { name: 'pattern.observer.name', family: 'behavioral', gist: 'pattern.observer.gist' },
  state: { name: 'pattern.state.name', family: 'behavioral', gist: 'pattern.state.gist' },
  command: { name: 'pattern.command.name', family: 'behavioral', gist: 'pattern.command.gist' },
  'chain-of-responsibility': { name: 'pattern.chainOfResponsibility.name', family: 'behavioral', gist: 'pattern.chainOfResponsibility.gist' },
  'template-method': { name: 'pattern.templateMethod.name', family: 'behavioral', gist: 'pattern.templateMethod.gist' },
  'ports-and-adapters': { name: 'pattern.portsAndAdapters.name', family: 'architecture', gist: 'pattern.portsAndAdapters.gist' },
  'event-bus': { name: 'pattern.eventBus.name', family: 'architecture', gist: 'pattern.eventBus.gist' },
  cqrs: { name: 'pattern.cqrs.name', family: 'architecture', gist: 'pattern.cqrs.gist' },
  'null-object': { name: 'pattern.nullObject.name', family: 'structural', gist: 'pattern.nullObject.gist' },
  'circuit-breaker': { name: 'pattern.circuitBreaker.name', family: 'resilience', gist: 'pattern.circuitBreaker.gist' },
  'keep-simple': { name: 'pattern.keepSimple.name', family: 'principle', gist: 'pattern.keepSimple.gist' },
  saga: { name: 'pattern.saga.name', family: 'architecture', gist: 'pattern.saga.gist' },
}

export const PATTERNS = Object.fromEntries(
  Object.entries(CATALOG).map(([id, info]) => [id, { ...info, seenIn: SEEN_IN[id as PatternId] }]),
) as Record<PatternId, PatternInfo>

export const FAMILY_NAMES: Record<PatternFamily, string> = {
  creational: 'family.creational',
  structural: 'family.structural',
  behavioral: 'family.behavioral',
  architecture: 'family.architecture',
  resilience: 'family.resilience',
  principle: 'family.principle',
}
