import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import saga from './saga.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommand from './ts/command.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsSaga from './ts/saga.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const notify = node('notify', 'Counter', [0, 5], { type: 'sink', expects: { hasTag: 'refunded' }, message: '' }, { codeRef: 'Counter#notify' })

export default defineLevel({
  id: 'saga',
  order: 23,
  chapter: 'resilience',
  targetPattern: 'saga',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('charge', 'Payments', [3, 2], { type: 'pass' }, { codeRef: 'Payments.charge' }),
      node('reserve', 'Inventory', [6.5, 2], { type: 'guard', require: { not: { hasTag: 'out-of-stock' } }, onFail: 'drop' }, { codeRef: 'Inventory.reserve' }),
      node('prepare', 'Barista', [10, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [13, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'charge', 'reserve', 'prepare', 'handOver'),
  },
  sockets: [
    {
      id: 'steps',
      at: 'reserve',
      inventory: ['saga', 'command', 'observer'],
      options: {
        saga: {
          outcome: 'solves',
          code: 'saga',
          patch: {
            update: [
              { id: 'reserve', behavior: { type: 'guard', require: { not: { hasTag: 'out-of-stock' } }, onFail: 'compensate' }, skin: 'saga' },
              { id: 'charge', skin: 'saga' },
            ],
            add: {
              nodes: [skinned('saga', node('refund', 'Payments', [3, 5], { type: 'transform', addTags: ['refunded'] }, { codeRef: 'Payments.refund' })), notify],
              wires: [wire('reserve', 'refund', { port: 'compensate' }), wire('refund', 'notify')],
            },
          },
        },
        command: {
          outcome: 'partial',
          code: 'command',
          patch: { update: [{ id: 'charge', skin: 'command', codeRef: 'ChargeCommand' }] },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          patch: {
            update: [{ id: 'reserve', behavior: { type: 'guard', require: { not: { hasTag: 'out-of-stock' } }, onFail: 'notify' }, skin: 'observer' }],
            add: { nodes: [notify], wires: [wire('reserve', 'notify', { port: 'notify' })] },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0), pulse(40), pulse(80, ['out-of-stock']), pulse(120)],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'dropped', op: '==', value: 0, label: '' },
    { metric: 'invalidAtSink', op: '==', value: 0, label: '' },
  ],
  code: { rb: { base: code(base), saga: code(saga), command: code(base + command), observer: code(base + observer) }, ts: { base: codeTs(tsBase), saga: codeTs(tsSaga), command: codeTs(tsBase + tsCommand), observer: codeTs(tsBase + tsObserver) } },
})
