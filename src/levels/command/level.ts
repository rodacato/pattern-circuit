import { defineLevel } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommand from './ts/command.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)

export default defineLevel({
  id: 'command',
  order: 13,
  chapter: 'rush-hour',
  targetPattern: 'command',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('counter', 'FrontDesk', [3, 2], { type: 'branch', cases: { 'cmd:order': 'out', 'cmd:cancel': 'undo' } }, { codeRef: 'FrontDesk#submit' }),
      node('undo', 'Undo', [6, 4.5], { type: 'branch', cases: {} }, { codeRef: 'Undo#call' }),
      node('barista', 'Barista', [9, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Pickup', [12, 2], { type: 'sink' }, { codeRef: 'Pickup#hand_over' }),
    ],
    wires: [wire('customer', 'counter'), wire('counter', 'barista'), wire('counter', 'undo', { port: 'undo' }), wire('barista', 'handOver')],
  },
  sockets: [
    {
      id: 'orders',
      at: 'counter',
      inventory: ['command', 'strategy', 'observer'],
      options: {
        command: {
          outcome: 'solves',
          code: 'command',
          patch: {
            remove: ['undo'],
            removeWires: ['counter->barista'],
            update: [{ id: 'counter', behavior: { type: 'transform', setShape: 'square' }, skin: 'command' }],
            add: {
              nodes: [
                skinned(
                  'command',
                  node('queue', 'CommandQueue', [6, 2], { type: 'buffer', cancelTag: 'cmd:cancel', match: 'order' }, { cost: 70, codeRef: 'CommandQueue#push' }),
                ),
              ],
              wires: [wire('counter', 'queue'), wire('queue', 'barista')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          patch: { update: [{ id: 'undo', behavior: { type: 'slot' }, skin: 'strategy', codeRef: 'CancelStrategy' }] },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          patch: {
            update: [{ id: 'undo', behavior: { type: 'broadcast' }, skin: 'observer', codeRef: 'CancelBroadcast' }],
            add: { wires: [abstract('undo', 'barista')] },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        pulse(0, ['cmd:order'], { order: 1 }),
        pulse(15, ['cmd:order'], { order: 2 }),
        pulse(30, ['cmd:cancel'], { order: 1 }),
        pulse(45, ['cmd:order'], { order: 3 }),
      ],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 2 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: { base: code(base), command: code(command), strategy: code(base + strategy), observer: code(base + observer) },
    ts: { base: codeTs(tsBase), command: codeTs(tsCommand), strategy: codeTs(tsBase + tsStrategy), observer: codeTs(tsBase + tsObserver) },
  },
})
