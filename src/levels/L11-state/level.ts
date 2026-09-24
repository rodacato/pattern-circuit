import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import state from './state.rb?raw'
import strategy from './strategy.rb?raw'

const code = withCommon(common)

const STATES = ['pendiente', 'pagado', 'preparando', 'entregado', 'cancelado']
const TARGET: Record<string, string> = { pagar: 'pagado', preparar: 'preparando', entregar: 'entregado', cancelar: 'cancelado' }
const VALID: Record<string, string[]> = { pendiente: ['pagar', 'cancelar'], pagado: ['preparar', 'cancelar'], preparando: ['entregar'], entregado: [], cancelado: [] }

// Sin patrón: todo evento cambia el status; los que no tenían sentido quedan marcados.
export const permissive = Object.fromEntries(
  STATES.map((s) => [
    s,
    Object.fromEntries(Object.entries(TARGET).map(([event, to]) => [event, VALID[s].includes(event) ? { to } : { to, addTags: ['fuera-de-orden'] }])),
  ]),
)

// Con State: cada estado solo conoce sus transiciones válidas.
export const strict = Object.fromEntries(STATES.map((s) => [s, Object.fromEntries(VALID[s].map((event) => [event, { to: TARGET[event] }]))]))

const events = ['pagar', 'entregar', 'preparar', 'entregar', 'cancelar'].map((e, i) => pulse(i * 40, e, [e], {}, 'eventos'))

export default defineLevel({
  id: 'L11-state',
  order: 11,
  chapter: 'hora-pico',
  title: 'La vida de un pedido',
  targetPattern: 'state',
  brief: {
    problem: 'Un pedido pasa por pendiente → pagado → preparando → entregado. El código cambia el status con cada evento sin preguntar: se "entrega" antes de preparar y se cancela algo ya entregado.',
    goal: 'Que un evento que no tiene sentido en el estado actual se rechace, sin llenar de ifs cada método.',
  },
  circuit: {
    nodes: [
      actor('eventos', 'Eventos', [0, 2]),
      node('pedido', 'Pedido', 'Order', [4, 2], { type: 'machine', initial: 'pendiente', states: permissive }, { codeRef: 'Order#handle' }),
      node('historial', 'Historial', 'History', [8, 2], { type: 'sink', expects: { not: { hasTag: 'fuera-de-orden' } } }, { codeRef: 'History#record' }),
    ],
    wires: chain('eventos', 'pedido', 'historial'),
  },
  sockets: [
    {
      id: 'estados',
      at: 'pedido',
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
            update: [{ id: 'pedido', behavior: { type: 'machine', initial: 'pendiente', states: strict, else: 'rechazo' }, skin: 'state' }],
            add: {
              nodes: [node('rechazo', 'Rechazar evento', 'History', [8, 4], { type: 'sink', message: '✋ evento rechazado' }, { codeRef: 'History#reject' })],
              wires: [wire('pedido', 'rechazo', { port: 'rechazo' })],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy la elige el cliente; State se reemplaza a sí mismo',
            body: 'Una estrategia por evento reparte el código, pero la elige quien llama y ninguna sabe en qué estado está el pedido: cada una aplica su cambio igual. En State, el objeto que decide es el estado actual, y él mismo indica cuál es el siguiente.',
          },
          patch: { update: [{ id: 'pedido', skin: 'strategy', codeRef: 'EventHandlers' }] },
        },
        command: {
          outcome: 'misfit',
          code: 'command',
          note: {
            title: 'Command ordena y guarda, no valida',
            body: 'Convertir los eventos en comandos encolados permite postergarlos o deshacerlos, pero la cola los ejecuta igual: el pedido sigue sin saber qué eventos tienen sentido.',
          },
          patch: {
            removeWires: ['eventos->pedido'],
            add: {
              nodes: [skinned('command', node('cola', 'Cola de eventos', 'EventQueue', [2, 0], { type: 'buffer', cancelTag: 'deshacer', match: 'evento' }, { cost: 6 }))],
              wires: [wire('eventos', 'cola'), wire('cola', 'pedido')],
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
  code: { rb: { base: code(base), state: code(state), strategy: code(strategy), command: code(base + command) } },
})
