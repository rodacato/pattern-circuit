import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import noticesBase from '../observer/base.rb?raw'
import noticesCommon from '../observer/common.rb?raw'
import noticesObserver from '../observer/observer.rb?raw'
import statesBase from '../state/base.rb?raw'
import statesCommon from '../state/common.rb?raw'
import { permissive, strict } from '../state/level'
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
const event = (at: number, id: string, cmd: number) => pulse(at, ['cmd:event', id], { cmd }, 'events')
const reskin = (id: string, skin: 'chain-of-responsibility' | 'proxy' | 'strategy' | 'template-method' | 'facade' | 'singleton') => ({ update: [{ id, skin }] })

export default defineLevel({
  id: 'live-orders',
  order: 17,
  chapter: 'all-together',
  circuit: {
    nodes: [
      actor('events', [0, 2]),
      node('counter', 'FrontDesk', [3, 2], { type: 'branch', cases: { 'cmd:event': 'out', 'cmd:undo': 'undo' } }, { codeRef: 'FrontDesk#submit' }),
      node('undo', 'Undo', [5, 4.5], { type: 'branch', cases: {} }, { codeRef: 'Undo#call' }),
      node('order', 'Order', [7, 2], { type: 'machine', initial: 'pending', states: permissive }, { codeRef: 'Order#handle' }),
      node('ready', 'Order', [10, 2], { type: 'broadcast' }, { codeRef: 'Order#complete!' }),
      node('display', 'Display', [13, 0], { type: 'sink', expects: notOutOfOrder, message: '' }, { codeRef: 'Display#update' }),
      node('loyalty', 'LoyaltyProgram', [13, 4], { type: 'sink', expects: notOutOfOrder, message: '' }, { codeRef: 'LoyaltyProgram#update' }),
    ],
    wires: [wire('events', 'counter'), wire('counter', 'order'), wire('counter', 'undo', { port: 'undo' }), ...chain('order', 'ready'), wire('ready', 'display')],
  },
  sockets: [
    {
      id: 'events',
      at: 'counter',
      code: 'events_base',
      inventory: ['command', 'chain-of-responsibility', 'proxy'],
      options: {
        command: {
          outcome: 'solves',
          code: 'events_command',
          patch: {
            remove: ['undo'],
            removeWires: ['counter->order'],
            update: [{ id: 'counter', behavior: { type: 'transform', setShape: 'square' }, skin: 'command' }],
            add: {
              nodes: [skinned('command', node('queue', 'CommandQueue', [5, 2], { type: 'buffer', cancelTag: 'cmd:undo', match: 'cmd' }, { cost: 50, codeRef: 'CommandQueue#push' }))],
              wires: chain('counter', 'queue', 'order'),
            },
          },
        },
        'chain-of-responsibility': {
          outcome: 'misfit',
          code: 'events_base',
          patch: reskin('undo', 'chain-of-responsibility'),
        },
        proxy: {
          outcome: 'misfit',
          code: 'events_base',
          patch: reskin('undo', 'proxy'),
        },
      },
    },
    {
      id: 'states',
      at: 'order',
      code: 'states_base',
      inventory: ['state', 'strategy', 'template-method'],
      options: {
        state: {
          outcome: 'solves',
          code: 'states_state',
          patch: {
            update: [{ id: 'order', behavior: { type: 'machine', initial: 'pending', states: strict, else: 'reject' }, skin: 'state' }],
            add: {
              nodes: [node('reject', 'History', [9, 5], { type: 'sink', message: '' }, { codeRef: 'History#reject' })],
              wires: [wire('order', 'reject', { port: 'reject' })],
            },
          },
        },
        strategy: { outcome: 'misfit', code: 'states_base', patch: reskin('order', 'strategy') },
        'template-method': {
          outcome: 'misfit',
          code: 'states_base',
          patch: reskin('order', 'template-method'),
        },
      },
    },
    {
      id: 'notices',
      at: 'ready',
      code: 'notices_base',
      inventory: ['observer', 'facade', 'singleton'],
      options: {
        observer: {
          outcome: 'solves',
          code: 'notices_observer',
          patch: {
            removeWires: ['ready->display'],
            update: [{ id: 'ready', skin: 'observer' }, { id: 'display', skin: 'observer' }, { id: 'loyalty', skin: 'observer' }],
            add: { wires: [abstract('ready', 'display'), abstract('ready', 'loyalty')] },
          },
        },
        facade: { outcome: 'misfit', code: 'notices_base', patch: reskin('ready', 'facade') },
        singleton: { outcome: 'misfit', code: 'notices_base', patch: reskin('ready', 'singleton') },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        event(0, 'pay', 1),
        event(20, 'deliver', 2),
        pulse(35, ['cmd:undo'], { cmd: 2 }, 'events'),
        event(60, 'prepare', 4),
        event(100, 'deliver', 5),
        event(140, 'cancel', 6),
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
