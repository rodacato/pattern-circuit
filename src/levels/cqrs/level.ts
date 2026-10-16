import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import cqrs from './cqrs.rb?raw'
import facade from './facade.rb?raw'
import singleton from './singleton.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsCqrs from './ts/cqrs.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const reads = Array.from({ length: 8 }, (_, i) => pulse(i * 10, ['read'], {}, 'displays'))
const writes = [5, 35, 65].map((at) => pulse(at, ['write'], {}, 'counter'))

export default defineLevel({
  id: 'cqrs',
  order: 20,
  chapter: 'architecture',
  targetPattern: 'cqrs',
  circuit: {
    nodes: [
      actor('displays', [0, 0]),
      actor('counter', [0, 4]),
      node('store', 'OrderStore', [5, 2], { type: 'branch', cases: { read: 'read', write: 'write' } }, { cost: 16, capacity: 1, codeRef: 'OrderStore#handle' }),
      node('board', 'OrderBoard', [10, 0], { type: 'sink', message: '' }, { codeRef: 'OrderBoard#show' }),
      node('registered', 'Counter', [10, 4], { type: 'sink', message: '' }, { codeRef: 'Counter#saved' }),
    ],
    wires: [wire('displays', 'store'), wire('counter', 'store'), wire('store', 'board', { port: 'read' }), wire('store', 'registered', { port: 'write' })],
  },
  sockets: [
    {
      id: 'model',
      at: 'store',
      inventory: ['cqrs', 'singleton', 'facade'],
      options: {
        cqrs: {
          outcome: 'solves',
          code: 'cqrs',
          patch: {
            remove: ['store'],
            add: {
              nodes: [
                skinned('cqrs', node('commands', 'PlaceOrder', [4, 4], { type: 'pass' }, { cost: 16, capacity: 1, codeRef: 'PlaceOrder#call' })),
                skinned('cqrs', node('projection', 'BoardProjection', [7, 4], { type: 'broadcast' }, { codeRef: 'BoardProjection#on_order_placed' })),
                skinned('cqrs', node('view', 'BoardQuery', [4, 0], { type: 'pass' }, { cost: 6, codeRef: 'BoardQuery#call' })),
              ],
              wires: [...chain('displays', 'view', 'board'), ...chain('counter', 'commands', 'projection'), wire('projection', 'registered'), abstract('projection', 'board')],
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          patch: { update: [{ id: 'store', skin: 'singleton' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          patch: {
            removeWires: ['displays->store', 'counter->store'],
            add: {
              nodes: [skinned('facade', node('desk', 'OrdersDesk', [2.5, 2], { type: 'pass' }, { codeRef: 'OrdersDesk' }))],
              wires: [wire('displays', 'desk'), wire('counter', 'desk'), wire('desk', 'store')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [...reads, ...writes] }],
  winWhen: [
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'maxLoad', op: '<=', value: 3 },
  ],
  code: { rb: { base: code(base), cqrs: code(cqrs), singleton: code(base + singleton), facade: code(base + facade) }, ts: { base: codeTs(tsBase), cqrs: codeTs(tsCqrs), singleton: codeTs(tsBase + tsSingleton), facade: codeTs(tsBase + tsFacade) } },
})
