import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import eventBus from './event_bus.rb?raw'
import simple from './simple.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommand from './py/command.py?raw'
import pyCommon from './py/common.py?raw'
import pyEventBus from './py/event_bus.py?raw'
import pySimple from './py/simple.py?raw'
import tsBase from './ts/base.ts?raw'
import tsCommand from './ts/command.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsEventBus from './ts/event_bus.ts?raw'
import tsSimple from './ts/simple.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const PIECES = 5 // notifying the kitchen needs no new pieces: one wire is enough

export default defineLevel({
  id: 'single-listener',
  order: 25,
  chapter: 'judgment',
  targetPattern: 'keep-simple',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('take', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('charge', 'Cashier', [6, 2], { type: 'pass' }, { codeRef: 'Cashier#charge' }),
      node('kitchen', 'Kitchen', [10, 2], { type: 'pass' }, { codeRef: 'Kitchen#start' }),
      node('handOver', 'Counter', [13, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [...chain('customer', 'take', 'charge'), wire('kitchen', 'handOver')],
  },
  sockets: [
    {
      id: 'notice',
      at: 'charge',
      inventory: ['event-bus', 'command', 'keep-simple'],
      options: {
        'keep-simple': {
          outcome: 'solves',
          code: 'simple',
          patch: { update: [{ id: 'charge', skin: 'keep-simple' }], add: { wires: [wire('charge', 'kitchen', { dep: 'concrete' })] } },
        },
        'event-bus': {
          outcome: 'misfit',
          code: 'event_bus',
          patch: {
            add: {
              nodes: [skinned('event-bus', node('bus', 'EventBus', [8, 0], { type: 'broadcast' }, { codeRef: 'EventBus#publish' }))],
              wires: [wire('charge', 'bus', { dep: 'concrete' }), abstract('bus', 'kitchen')],
            },
          },
        },
        command: {
          outcome: 'misfit',
          code: 'command',
          patch: {
            add: {
              nodes: [skinned('command', node('startOrder', 'StartOrder', [8, 0], { type: 'pass' }, { codeRef: 'StartOrder#call' }))],
              wires: [wire('charge', 'startOrder', { dep: 'concrete' }), wire('startOrder', 'kitchen', { dep: 'concrete' })],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0), pulse(40), pulse(80)] }],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'nodes', op: '<=', value: PIECES },
  ],
  code: {
    rb: { base: code(base), simple: code(simple), event_bus: code(eventBus), command: code(command) },
    ts: { base: codeTs(tsBase), simple: codeTs(tsSimple), event_bus: codeTs(tsEventBus), command: codeTs(tsCommand) },
    py: { base: codePy(pyBase), simple: codePy(pySimple), event_bus: codePy(pyEventBus), command: codePy(pyCommand) },
  },
})
