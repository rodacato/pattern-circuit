import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import state from './state.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommand from './ts/command.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsState from './ts/state.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)

const STATES = ['pendiente', 'pagado', 'preparando', 'entregado', 'cancelado']
// Events are identified in English; the Spanish name is the text the player reads on the pulse.
export const EVENT_LABELS: Record<string, string> = { pay: 'pagar', prepare: 'preparar', deliver: 'entregar', cancel: 'cancelar' }
const TARGET: Record<string, string> = { pay: 'pagado', prepare: 'preparando', deliver: 'entregado', cancel: 'cancelado' }
const VALID: Record<string, string[]> = { pendiente: ['pay', 'cancel'], pagado: ['prepare', 'cancel'], preparando: ['deliver'], entregado: [], cancelado: [] }

// Without a pattern: every event changes the status; the ones that made no sense are left marked.
export const permissive = Object.fromEntries(
  STATES.map((s) => [
    s,
    Object.fromEntries(Object.entries(TARGET).map(([event, to]) => [event, VALID[s].includes(event) ? { to } : { to, addTags: ['out-of-order'] }])),
  ]),
)

// With State: each state only knows its valid transitions.
export const strict = Object.fromEntries(STATES.map((s) => [s, Object.fromEntries(VALID[s].map((event) => [event, { to: TARGET[event] }]))]))

const events = ['pay', 'deliver', 'prepare', 'deliver', 'cancel'].map((e, i) => pulse(i * 40, EVENT_LABELS[e], [e], {}, 'events'))

export default defineLevel({
  id: 'state',
  order: 11,
  chapter: 'rush-hour',
  title: 'La vida de un pedido',
  targetPattern: 'state',
  brief: {
    problem: 'Un pedido pasa por pendiente → pagado → preparando → entregado. El código cambia el status con cada evento sin preguntar: se "entrega" antes de preparar y se cancela algo ya entregado.',
    goal: 'Que un evento que no tiene sentido en el estado actual se rechace, sin llenar de ifs cada método.',
  },
  circuit: {
    nodes: [
      actor('events', 'Eventos', [0, 2]),
      node('order', 'Pedido', 'Order', [4, 2], { type: 'machine', initial: 'pendiente', states: permissive }, { codeRef: 'Order#handle' }),
      node('history', 'Historial', 'History', [8, 2], { type: 'sink', expects: { not: { hasTag: 'out-of-order' } } }, { codeRef: 'History#record' }),
    ],
    wires: chain('events', 'order', 'history'),
  },
  sockets: [
    {
      id: 'states',
      at: 'order',
      label: 'Estados',
      inventory: ['state', 'strategy', 'command'],
      options: {
        state: {
          outcome: 'solves',
          code: 'state',
          note: {
            title: 'State: el comportamiento cambia con el estado',
            body: 'Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva. El pedido delega en su estado actual: lo que no tiene sentido se rechaza sin un solo if repartido.',
          },
          patch: {
            update: [{ id: 'order', behavior: { type: 'machine', initial: 'pendiente', states: strict, else: 'reject' }, skin: 'state' }],
            add: {
              nodes: [node('reject', 'Rechazar evento', 'History', [8, 4], { type: 'sink', message: '✋ evento rechazado' }, { codeRef: 'History#reject' })],
              wires: [wire('order', 'reject', { port: 'reject' })],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy la elige quien llama; en State decide el estado actual',
            body: 'Una estrategia por evento reparte el código, pero la elige quien llama y ninguna sabe en qué estado está el pedido: cada una aplica su cambio igual. En State decide el estado actual, y normalmente él mismo indica el siguiente.',
          },
          patch: { update: [{ id: 'order', skin: 'strategy', codeRef: 'EventHandlers' }] },
        },
        command: {
          outcome: 'misfit',
          code: 'command',
          note: {
            title: 'Command ordena y guarda, no valida',
            body: 'Convertir los eventos en comandos encolados permite postergarlos o deshacerlos, pero la cola los ejecuta igual: el pedido sigue sin saber qué eventos tienen sentido.',
          },
          patch: {
            removeWires: ['events->order'],
            add: {
              nodes: [skinned('command', node('queue', 'Cola de eventos', 'EventQueue', [2, 0], { type: 'buffer', cancelTag: 'undo', match: 'event' }, { cost: 6 }))],
              wires: [wire('events', 'queue'), wire('queue', 'order')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: events }],
  winWhen: [
    { metric: 'invalidAtSink', op: '==', value: 0, label: 'eventos fuera de orden registrados' },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: { base: code(base), state: code(state), strategy: code(strategy), command: code(base + command) },
    ts: { base: codeTs(tsBase), state: codeTs(tsState), strategy: codeTs(tsStrategy), command: codeTs(tsBase + tsCommand) },
  },
})
