// Formato de datos de un nivel. Es la única fuente de verdad: los tipos del
// motor se infieren de aquí y el loader valida cada nivel contra este esquema.
import { z } from 'zod'

export const PULSE_SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export const PATTERN_IDS = [
  'factory-method', 'builder', 'singleton',
  'adapter', 'decorator', 'proxy', 'composite', 'facade',
  'strategy', 'observer', 'state', 'command', 'chain-of-responsibility', 'template-method',
  'ports-and-adapters', 'event-bus', 'cqrs',
  'null-object', 'circuit-breaker', 'saga',
] as const

export const PulseShape = z.enum(PULSE_SHAPES)
export const PatternId = z.enum(PATTERN_IDS)

const Json: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(Json), z.record(z.string(), Json)]),
)

// Predicados declarativos sobre un pulso: nada de funciones en los datos.
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

// Vocabulario cerrado de primitivas. Un patrón nunca es código del motor:
// es una composición de estas primitivas más un skin visual.
export const Behavior = z.discriminatedUnion('type', [
  z.object({ type: z.literal('source') }),
  z.object({
    type: z.literal('sink'),
    expects: Predicate.optional(),
    uniqueBy: z.string().optional(), // un valor repetido en este campo es una entrega inválida
    message: z.string().optional(),
  }),
  z.object({ type: z.literal('pass') }),
  z.object({
    type: z.literal('transform'),
    when: Predicate.optional(), // si no se cumple, el pulso pasa sin cambios
    addTags: z.array(z.string()).optional(),
    removeTags: z.array(z.string()).optional(),
    setShape: PulseShape.optional(),
    setData: z.record(z.string(), Json).optional(),
  }),
  // Árbol de if/elsif interno: `cases` es etiqueta -> puerto, en orden de evaluación.
  z.object({
    type: z.literal('branch'),
    cases: z.record(z.string(), z.string()),
    else: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Punto de variación: enruta al cable abstracto cuya `key` coincide con una
  // etiqueta del pulso. Los cables registrados no cuentan como modificar el nodo.
  z.object({ type: z.literal('slot') }),
  z.object({ type: z.literal('broadcast') }),
  z.object({
    type: z.literal('guard'),
    require: Predicate,
    onFail: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Numera cada pulso en `data[field]`. Nodos con la misma `key` comparten la cuenta; `fresh` empieza de cero cada vez.
  z.object({ type: z.literal('counter'), key: z.string(), field: z.string().default('ticket'), fresh: z.boolean().default(false) }),
  // Espera a todas las partes de un mismo pedido (una por cable de entrada) y sigue con una sola.
  z.object({ type: z.literal('join') }),
  // Recuerda valores de `data[key]`: los ya vistos salen por `hit`, los nuevos por `miss`.
  z.object({ type: z.literal('cache'), key: z.string() }),
  // Máquina de estados con memoria entre pulsos: estado actual × etiqueta → transición.
  z.object({
    type: z.literal('machine'),
    initial: z.string(),
    states: z.record(z.string(), z.record(z.string(), Transition)),
    else: z.union([z.literal('drop'), z.string()]).default('drop'),
  }),
  // Interruptor: deja pasar por `call` hasta ver `threshold` pulsos con `failTag`; entonces se abre y todo va por `fallback`.
  z.object({ type: z.literal('breaker'), threshold: z.number().int().positive(), failTag: z.string() }),
  // Retiene cada pulso `cost` ticks; un pulso con `cancelTag` anula al retenido con el mismo `data[match]`.
  z.object({ type: z.literal('buffer'), cancelTag: z.string(), match: z.string() }),
])

export const NodeDef = z.object({
  id: z.string(),
  label: z.string(),
  className: z.string().optional(),
  kind: z.enum(['class', 'interface', 'external', 'actor']).default('class'),
  at: z.tuple([z.number(), z.number()]),
  behavior: Behavior,
  cost: z.number().int().nonnegative().optional(), // ticks que el pulso pasa dentro
  capacity: z.number().int().positive().optional(), // pulsos simultáneos; sin límite si falta
  codeRef: z.string().optional(),
  skin: PatternId.optional(),
})

export const WireDef = z.object({
  id: z.string().optional(),
  from: z.string(),
  port: z.string().default('out'),
  to: z.string(),
  dep: z.enum(['concrete', 'abstract']).default('concrete'),
  key: z.string().optional(), // para cables que salen de un `slot`
})

export const Circuit = z.object({
  nodes: z.array(NodeDef),
  wires: z.array(WireDef),
})

export const GraphPatch = z.object({
  remove: z.array(z.string()).optional(), // ids de nodos; se llevan sus cables
  removeWires: z.array(z.string()).optional(),
  update: z.array(NodeDef.partial().extend({ id: z.string() })).optional(),
  add: Circuit.partial().optional(),
})

export const FieldNote = z.object({
  title: z.string(),
  body: z.string(),
})

export const SocketOption = z.object({
  outcome: z.enum(['solves', 'partial', 'misfit']),
  patch: GraphPatch,
  note: FieldNote,
  code: z.string(), // clave dentro de level.code
})

export const SocketDef = z.object({
  id: z.string(),
  at: z.string(), // nodo donde aparece el socket
  label: z.string(),
  inventory: z.array(PatternId),
  options: z.partialRecord(PatternId, SocketOption),
  code: z.string().optional(), // con varios sockets: fragmento de código mientras está vacío
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
  text: z.string(),
  scenario: z.string(), // escenario que ejercita el cambio
  without: GraphPatch, // aplicado al circuito base
  with: GraphPatch, // aplicado al circuito ya resuelto
  code: z.object({ without: z.string().optional(), with: z.string().optional() }).default({}),
})

export const Repair = z.object({
  id: z.string(),
  prompt: z.string(),
  patch: GraphPatch,
  code: z.string().optional(),
})

// Acciones del jugador que un nivel puede pedir en su lista de pasos (tutoriales).
export const PLAYER_ACTIONS = ['play', 'pause', 'step', 'back', 'reset', 'speed', 'repair', 'inspect-node', 'follow-pulse'] as const
export const PlayerAction = z.enum(PLAYER_ACTIONS)

export const ChecklistItem = z.object({
  text: z.string(),
  on: PlayerAction,
})

export const METRICS = ['spawned', 'delivered', 'dropped', 'invalidAtSink', 'duplicatesAtSink', 'cancelled', 'maxLoad', 'nodesTouched'] as const

export const Assertion = z.object({
  metric: z.enum(METRICS),
  op: z.enum(['==', '<=', '>=']),
  value: z.number(),
  label: z.string().optional(), // cómo se lee la métrica en este nivel ("eventos fuera de orden")
})

export const LevelDef = z.object({
  id: z.string(),
  order: z.number().int(),
  chapter: z.string(),
  title: z.string(),
  targetPattern: PatternId.optional(),
  brief: z.object({ problem: z.string(), goal: z.string() }),
  circuit: Circuit,
  sockets: z.array(SocketDef).default([]),
  repairs: z.array(Repair).default([]),
  scenarios: z.array(Scenario).min(1),
  changeTickets: z.array(ChangeTicket).max(1).default([]), // el flujo del nivel tiene una sola etapa de cambio
  winWhen: z.array(Assertion).default([]),
  checklist: z.array(ChecklistItem).default([]),
  code: z.object({ rb: z.record(z.string(), z.string()) }), // { base, strategy, ... }
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
