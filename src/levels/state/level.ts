import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import state from './state.rb?raw'
import strategy from './strategy.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommand from './py/command.py?raw'
import pyCommon from './py/common.py?raw'
import pyState from './py/state.py?raw'
import pyStrategy from './py/strategy.py?raw'
import tsBase from './ts/base.ts?raw'
import tsCommand from './ts/command.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsState from './ts/state.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)

const STATES = ['pending', 'paid', 'preparing', 'delivered', 'cancelled']
const TARGET: Record<string, string> = { pay: 'paid', prepare: 'preparing', deliver: 'delivered', cancel: 'cancelled' }
const VALID: Record<string, string[]> = { pending: ['pay', 'cancel'], paid: ['prepare', 'cancel'], preparing: ['deliver'], delivered: [], cancelled: [] }

// Without a pattern: every event changes the status; the ones that made no sense are left marked.
export const permissive = Object.fromEntries(
  STATES.map((s) => [
    s,
    Object.fromEntries(Object.entries(TARGET).map(([event, to]) => [event, VALID[s].includes(event) ? { to } : { to, addTags: ['out-of-order'] }])),
  ]),
)

// With State: each state only knows its valid transitions.
export const strict = Object.fromEntries(STATES.map((s) => [s, Object.fromEntries(VALID[s].map((event) => [event, { to: TARGET[event] }]))]))

const events = ['pay', 'deliver', 'prepare', 'deliver', 'cancel'].map((e, i) => pulse(i * 40, [e], {}, 'events'))

export default defineLevel({
  id: 'state',
  order: 11,
  chapter: 'rush-hour',
  targetPattern: 'state',
  circuit: {
    nodes: [
      actor('events', [0, 2]),
      node('order', 'Order', [4, 2], { type: 'machine', initial: 'pending', states: permissive }, { codeRef: 'Order#handle' }),
      node('history', 'History', [8, 2], { type: 'sink', expects: { not: { hasTag: 'out-of-order' } } }, { codeRef: 'History#record' }),
    ],
    wires: chain('events', 'order', 'history'),
  },
  sockets: [
    {
      id: 'states',
      at: 'order',
      inventory: ['state', 'strategy', 'command'],
      options: {
        state: {
          outcome: 'solves',
          code: 'state',
          patch: {
            update: [{ id: 'order', behavior: { type: 'machine', initial: 'pending', states: strict, else: 'reject' }, skin: 'state' }],
            add: {
              nodes: [node('reject', 'History', [8, 4], { type: 'sink', message: '' }, { codeRef: 'History#reject' })],
              wires: [wire('order', 'reject', { port: 'reject' })],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          patch: { update: [{ id: 'order', skin: 'strategy', codeRef: 'EventHandlers' }] },
        },
        command: {
          outcome: 'misfit',
          code: 'command',
          patch: {
            removeWires: ['events->order'],
            add: {
              nodes: [skinned('command', node('queue', 'EventQueue', [2, 0], { type: 'buffer', cancelTag: 'undo', match: 'event' }, { cost: 6 }))],
              wires: [wire('events', 'queue'), wire('queue', 'order')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: events }],
  winWhen: [
    { metric: 'invalidAtSink', op: '==', value: 0, label: '' },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: { base: code(base), state: code(state), strategy: code(strategy), command: code(base + command) },
    ts: { base: codeTs(tsBase), state: codeTs(tsState), strategy: codeTs(tsStrategy), command: codeTs(tsBase + tsCommand) },
    py: { base: codePy(pyBase), state: codePy(pyState), strategy: codePy(pyStrategy), command: codePy(pyBase + pyCommand) },
  },
})
