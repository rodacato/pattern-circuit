import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import noticesBase from '../observer/base.rb?raw'
import noticesCommon from '../observer/common.rb?raw'
import noticesObserver from '../observer/observer.rb?raw'
import statesBase from '../state/base.rb?raw'
import statesCommon from '../state/common.rb?raw'
import { EVENT_LABELS, permissive, strict } from '../state/level'
import eventsCommand from './events_command.rb?raw'
import statesState from '../state/state.rb?raw'
import eventsBase from '../command/base.rb?raw'
import tsNoticesBase from '../observer/ts/base.ts?raw'
import tsNoticesCommon from '../observer/ts/common.ts?raw'
import tsNoticesObserver from '../observer/ts/observer.ts?raw'
import tsStatesBase from '../state/ts/base.ts?raw'
import tsStatesCommon from '../state/ts/common.ts?raw'
import tsStatesState from '../state/ts/state.ts?raw'
import tsEventsBase from '../command/ts/base.ts?raw'
import tsEventsCommand from './ts/events_command.ts?raw'

const notOutOfOrder = { not: { hasTag: 'out-of-order' } }
const event = (at: number, id: string, cmd: number, label = EVENT_LABELS[id]) => pulse(at, label, ['cmd:event', id], { cmd }, 'events')
const reskin = (id: string, skin: 'chain-of-responsibility' | 'proxy' | 'strategy' | 'template-method' | 'facade' | 'singleton') => ({ update: [{ id, skin }] })

export default defineLevel({
  id: 'live-orders',
  order: 17,
  chapter: 'all-together',
  title: 'Pedidos en vivo',
  brief: {
    problem: 'Un pedido recibe eventos en vivo. Un "entregar" enviado por error no se puede deshacer, el pedido acepta eventos que no tienen sentido, y cuando cambia de estado solo la pantalla se entera.',
    goal: 'Deshacer a tiempo lo enviado por error, rechazar lo que no aplica y avisar a todos los interesados.',
  },
  circuit: {
    nodes: [
      actor('events', 'Eventos', [0, 2]),
      node('counter', 'Mostrador', 'FrontDesk', [3, 2], { type: 'branch', cases: { 'cmd:event': 'out', 'cmd:undo': 'undo' } }, { codeRef: 'FrontDesk#submit' }),
      node('undo', 'Deshacer', 'Undo', [5, 4.5], { type: 'branch', cases: {} }, { codeRef: 'Undo#call' }),
      node('order', 'Pedido', 'Order', [7, 2], { type: 'machine', initial: 'pendiente', states: permissive }, { codeRef: 'Order#handle' }),
      node('ready', 'Avisar cambio', 'Order', [10, 2], { type: 'broadcast' }, { codeRef: 'Order#complete!' }),
      node('display', 'Pantalla', 'Display', [13, 0], { type: 'sink', expects: notOutOfOrder, message: '🔔 pantalla' }, { codeRef: 'Display#update' }),
      node('loyalty', 'Lealtad', 'LoyaltyProgram', [13, 4], { type: 'sink', expects: notOutOfOrder, message: '🔔 lealtad' }, { codeRef: 'LoyaltyProgram#update' }),
    ],
    wires: [wire('events', 'counter'), wire('counter', 'order'), wire('counter', 'undo', { port: 'undo' }), ...chain('order', 'ready'), wire('ready', 'display')],
  },
  sockets: [
    {
      id: 'events',
      at: 'counter',
      label: 'Eventos',
      code: 'events_base',
      inventory: ['command', 'chain-of-responsibility', 'proxy'],
      options: {
        command: {
          outcome: 'solves',
          code: 'events_command',
          note: { title: 'Command: eventos que se pueden retirar', body: 'Cada evento es una tarjeta en cola. El "entregar" enviado por error se retira antes de que llegue al pedido.' },
          patch: {
            remove: ['undo'],
            removeWires: ['counter->order'],
            update: [{ id: 'counter', behavior: { type: 'transform', setShape: 'square' }, skin: 'command' }],
            add: {
              nodes: [skinned('command', node('queue', 'Cola', 'CommandQueue', [5, 2], { type: 'buffer', cancelTag: 'cmd:undo', match: 'cmd' }, { cost: 50, codeRef: 'CommandQueue#push' }))],
              wires: chain('counter', 'queue', 'order'),
            },
          },
        },
        'chain-of-responsibility': {
          outcome: 'misfit',
          code: 'events_base',
          note: { title: 'Una cadena no deshace', body: 'Pasar la cancelación de mano en mano no sirve si el evento ya se ejecutó: nadie puede atenderla.' },
          patch: reskin('undo', 'chain-of-responsibility'),
        },
        proxy: {
          outcome: 'misfit',
          code: 'events_base',
          note: { title: 'Un proxy no vuelve en el tiempo', body: 'Un intermediario delante del pedido no guarda los eventos como objetos que se puedan retirar.' },
          patch: reskin('undo', 'proxy'),
        },
      },
    },
    {
      id: 'states',
      at: 'order',
      label: 'Estados',
      code: 'states_base',
      inventory: ['state', 'strategy', 'template-method'],
      options: {
        state: {
          outcome: 'solves',
          code: 'states_state',
          note: { title: 'State: cada estado sabe qué acepta', body: 'Cancelar algo ya entregado se rechaza en el estado "entregado", sin ifs repartidos.' },
          patch: {
            update: [{ id: 'order', behavior: { type: 'machine', initial: 'pendiente', states: strict, else: 'reject' }, skin: 'state' }],
            add: {
              nodes: [node('reject', 'Rechazar evento', 'History', [9, 5], { type: 'sink', message: '✋ evento rechazado' }, { codeRef: 'History#reject' })],
              wires: [wire('order', 'reject', { port: 'reject' })],
            },
          },
        },
        strategy: { outcome: 'misfit', code: 'states_base', note: { title: 'Strategy la elige quien llama; en State decide el estado actual', body: 'Una estrategia por evento aplica su cambio sin saber en qué estado está el pedido. En State decide el estado actual, y normalmente él mismo indica el siguiente.' }, patch: reskin('order', 'strategy') },
        'template-method': {
          outcome: 'misfit',
          code: 'states_base',
          note: { title: 'Un esqueleto fijo no valida transiciones', body: 'Template Method fija el orden de unos pasos; aquí el problema es qué eventos tienen sentido según el estado.' },
          patch: reskin('order', 'template-method'),
        },
      },
    },
    {
      id: 'notices',
      at: 'ready',
      label: 'Avisos',
      code: 'notices_base',
      inventory: ['observer', 'facade', 'singleton'],
      options: {
        observer: {
          outcome: 'solves',
          code: 'notices_observer',
          note: { title: 'Observer: cada cambio llega a todos', body: 'Pantalla y Lealtad se suscriben al pedido. Los tres patrones conviven: Command decide qué llega, State qué se acepta, Observer quién se entera.' },
          patch: {
            removeWires: ['ready->display'],
            update: [{ id: 'ready', skin: 'observer' }, { id: 'display', skin: 'observer' }, { id: 'loyalty', skin: 'observer' }],
            add: { wires: [abstract('ready', 'display'), abstract('ready', 'loyalty')] },
          },
        },
        facade: { outcome: 'misfit', code: 'notices_base', note: { title: 'Facade no difunde', body: 'Una puerta simple para avisar sigue llamando a quien conoce: Lealtad sigue sin enterarse.' }, patch: reskin('ready', 'facade') },
        singleton: { outcome: 'misfit', code: 'notices_base', note: { title: 'Singleton no suma interesados', body: 'Tener un único notificador compartido no cambia a quién le avisa.' }, patch: reskin('ready', 'singleton') },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        event(0, 'pay', 1),
        event(20, 'deliver', 2, 'entregar (por error)'),
        pulse(35, 'deshacer entregar', ['cmd:undo'], { cmd: 2 }, 'events'),
        event(60, 'prepare', 4),
        event(100, 'deliver', 5),
        event(140, 'cancel', 6, 'cancelar (ya entregado)'),
      ],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 7 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: `${statesCommon}\n${noticesCommon}`,
      events_base: eventsBase,
      events_command: eventsCommand,
      states_base: statesBase,
      states_state: statesState,
      notices_base: noticesBase,
      notices_observer: noticesObserver,
    },
    ts: {
      base: `${tsStatesCommon}\n${tsNoticesCommon}`,
      events_base: tsEventsBase,
      events_command: tsEventsCommand,
      states_base: tsStatesBase,
      states_state: tsStatesState,
      notices_base: tsNoticesBase,
      notices_observer: tsNoticesObserver,
    },
  },
})
