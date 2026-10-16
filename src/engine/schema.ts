// Data format of a level. It is the single source of truth: the engine
// types are inferred from here and the loader validates each level against this schema.
// Text fields (`label`, `title`, `text`…) default to '' and are filled with their catalog key by `qualifyTexts`.
import { z } from 'zod'

export const CODE_LANGS = ['rb', 'ts'] as const
export type CodeLang = (typeof CODE_LANGS)[number]

export const PULSE_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export const PATTERN_IDS = [
  'factory-method', 'builder', 'singleton',
  'adapter', 'decorator', 'proxy', 'composite', 'facade',
  'strategy', 'observer', 'state', 'command', 'chain-of-responsibility', 'template-method',
  'ports-and-adapters', 'event-bus', 'cqrs',
  'null-object', 'circuit-breaker', 'saga',
  'keep-simple', // not applying a pattern is also a design decision
] as const

export const PulseShape = z.enum(PULSE_SHAPES)
export const PatternId = z.enum(PATTERN_IDS)

const Json: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(Json), z.record(z.string(), Json)]),
)

// Declarative predicates on a pulse: no functions in the data.
export type Predicate =
  | { hasTag: string }
  | { shape: z.infer<typeof PulseShape> }
  | { field: string; eq: unknown }
  | { not: Predicate }
  | { all: Predicate[] }
  | { any: Predicate[] }

export const Predicate: z.ZodType<Predicate> = z.lazy(() =>
  z.union([
    z.object({ hasTag: z.string() }),
    z.object({ shape: PulseShape }),
    z.object({ field: z.string(), eq: Json }),
    z.object({ not: Predicate }),
    z.object({ all: z.array(Predicate) }),
    z.object({ any: z.array(Predicate) }),
  ]),
)

const Transition = z.object({
  to: z.string().optional(),
  port: z.string().default('out'),
  addTags: z.array(z.string()).optional(),
})

// Closed vocabulary of primitives. A pattern is never engine code:
// it is a composition of these primitives plus a visual skin.
export const Behavior = z.discriminatedUnion('type', [
  z.object({ type: z.literal('source') }),
  z.object({
    type: z.literal('sink'),
    expects: Predicate.optional(),
    uniqueBy: z.string().optional(), // a repeated value in this field is an invalid delivery
    message: z.string().optional(),
  }),
  z.object({ type: z.literal('pass') }),
  z.object({
    type: z.literal('transform'),
    when: Predicate.optional(), // if it does not hold, the pulse passes unchanged
    addTags: z.array(z.string()).optional(),
    removeTags: z.array(z.string()).optional(),
    setShape: PulseShape.optional(),
    setData: z.record(z.string(), Json).optional(),
  }),
  // Internal if/elsif tree: `cases` is tag -> port, in evaluation order.
  z.object({
    type: z.literal('branch'),
    cases: z.record(z.string(), z.string()),
    else: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Variation point: routes to the abstract wire whose `key` matches a
  // pulse tag. Registered wires do not count as modifying the node.
  z.object({ type: z.literal('slot') }),
  z.object({ type: z.literal('broadcast') }),
  z.object({
    type: z.literal('guard'),
    require: Predicate,
    onFail: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Numbers each pulse in `data[field]`. Nodes with the same `key` share the count; `fresh` starts from zero each time.
  z.object({ type: z.literal('counter'), key: z.string(), field: z.string().default('ticket'), fresh: z.boolean().default(false) }),
  // Waits for all the parts of one order (one per input wire) and continues as a single one.
  z.object({ type: z.literal('join') }),
  // Remembers values of `data[key]`: already seen ones leave through `hit`, new ones through `miss`.
  z.object({ type: z.literal('cache'), key: z.string() }),
  // State machine with memory between pulses: current state × tag → transition.
  z.object({
    type: z.literal('machine'),
    initial: z.string(),
    states: z.record(z.string(), z.record(z.string(), Transition)),
    else: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Breaker: lets pulses through `call` until it sees `threshold` pulses with `failTag`; then it opens and everything goes through `fallback`.
  z.object({ type: z.literal('breaker'), threshold: z.number().int().positive(), failTag: z.string() }),
  // Holds each pulse for `cost` ticks; a pulse with `cancelTag` cancels the held one with the same `data[match]`.
  z.object({ type: z.literal('buffer'), cancelTag: z.string(), match: z.string() }),
])

export const NodeDef = z.object({
  id: z.string(),
  label: z.string().default(''), // empty: its text is `node.<id>` in the level's catalog
  className: z.string().optional(),
  kind: z.enum(['class', 'interface', 'external', 'actor']).default('class'),
  at: z.tuple([z.number(), z.number()]),
  behavior: Behavior,
  cost: z.number().int().nonnegative().optional(), // ticks the pulse spends inside
  capacity: z.number().int().positive().optional(), // simultaneous pulses; unlimited if missing
  codeRef: z.string().optional(),
  skin: PatternId.optional(),
})

export const WireDef = z.object({
  id: z.string().optional(),
  from: z.string(),
  port: z.string().default('out'),
  to: z.string(),
  dep: z.enum(['concrete', 'abstract']).default('concrete'),
  key: z.string().optional(), // for wires leaving a `slot`
})

export const Circuit = z.object({
  nodes: z.array(NodeDef),
  wires: z.array(WireDef),
})

export const GraphPatch = z.object({
  remove: z.array(z.string()).optional(), // node ids; their wires go with them
  removeWires: z.array(z.string()).optional(),
  update: z.array(NodeDef.partial().extend({ id: z.string() })).optional(),
  add: Circuit.partial().optional(),
})

export const FieldNote = z.object({
  title: z.string().default(''),
  body: z.string().default(''),
})

export const SocketOption = z.object({
  outcome: z.enum(['solves', 'partial', 'misfit']),
  patch: GraphPatch,
  note: FieldNote.default({ title: '', body: '' }),
  code: z.string(), // key inside level.code
})

export const SocketDef = z.object({
  id: z.string(),
  at: z.string(), // node where the socket appears
  label: z.string().default(''),
  inventory: z.array(PatternId),
  options: z.partialRecord(PatternId, SocketOption),
  code: z.string().optional(), // with several sockets: code fragment while it is empty
})

export const ScenarioPulse = z.object({
  at: z.number().int().nonnegative(), // tick
  from: z.string(),
  shape: PulseShape.default('circle'),
  tags: z.array(z.string()).default([]),
  data: z.record(z.string(), Json).default({}),
  label: z.string().optional(),
})

export const Scenario = z.object({
  id: z.string(),
  pulses: z.array(ScenarioPulse),
})

export const ChangeTicket = z.object({
  id: z.string(),
  text: z.string().default(''),
  scenario: z.string(), // scenario that exercises the change
  without: GraphPatch, // applied to the base circuit
  with: GraphPatch, // applied to the already resolved circuit
  code: z.object({ without: z.string().optional(), with: z.string().optional() }).default({}),
})

export const Repair = z.object({
  id: z.string(),
  prompt: z.string().default(''),
  patch: GraphPatch,
  code: z.string().optional(),
})

// Player actions a level can ask for in its list of steps (tutorials).
export const PLAYER_ACTIONS = ['play', 'pause', 'step', 'back', 'reset', 'speed', 'repair', 'inspect-node', 'follow-pulse'] as const
export const PlayerAction = z.enum(PLAYER_ACTIONS)

export const ChecklistItem = z.object({
  text: z.string().default(''),
  on: PlayerAction,
})

export const METRICS = ['spawned', 'delivered', 'dropped', 'invalidAtSink', 'duplicatesAtSink', 'cancelled', 'maxLoad', 'nodesTouched', 'nodes'] as const

export const Assertion = z.object({
  metric: z.enum(METRICS),
  op: z.enum(['==', '<=', '>=']),
  value: z.number(),
  label: z.string().optional(), // how the metric reads in this level ("out-of-order events")
})

export const LevelDef = z.object({
  id: z.string(),
  order: z.number().int(),
  chapter: z.string(),
  title: z.string().default(''),
  targetPattern: PatternId.optional(),
  brief: z.object({ problem: z.string().default(''), goal: z.string().default('') }).default({ problem: '', goal: '' }),
  circuit: Circuit,
  sockets: z.array(SocketDef).default([]),
  repairs: z.array(Repair).default([]),
  scenarios: z.array(Scenario).min(1),
  changeTickets: z.array(ChangeTicket).max(1).default([]), // the level flow has a single change stage
  winWhen: z.array(Assertion).default([]),
  checklist: z.array(ChecklistItem).default([]),
  // One fragment per key ({ base, strategy, … }) in each language; Ruby is the reference.
  code: z.object({ rb: z.record(z.string(), z.string()), ts: z.record(z.string(), z.string()).optional() }),
})

export type PulseShape = z.infer<typeof PulseShape>
export type PatternId = z.infer<typeof PatternId>
export type Behavior = z.infer<typeof Behavior>
export type NodeDef = z.infer<typeof NodeDef>
export type WireDef = z.infer<typeof WireDef>
export type Circuit = z.infer<typeof Circuit>
export type GraphPatch = z.infer<typeof GraphPatch>
export type SocketDef = z.infer<typeof SocketDef>
export type SocketOption = z.infer<typeof SocketOption>
export type Scenario = z.infer<typeof Scenario>
export type ScenarioPulse = z.infer<typeof ScenarioPulse>
export type ChangeTicket = z.infer<typeof ChangeTicket>
export type Assertion = z.infer<typeof Assertion>
export type PlayerAction = z.infer<typeof PlayerAction>
export type MetricName = (typeof METRICS)[number]
export type LevelDef = z.infer<typeof LevelDef>
export type LevelInput = z.input<typeof LevelDef>
export type NodeInput = z.input<typeof NodeDef>
export type WireInput = z.input<typeof WireDef>
export type BehaviorInput = z.input<typeof Behavior>
