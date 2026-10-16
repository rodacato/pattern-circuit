import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import ports from './ports.rb?raw'
import singleton from './singleton.rb?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsPorts from './ts/ports.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const external = (id: string, className: string, at: [number, number], codeRef: string): NodeInput =>
  node(id, className, at, { type: 'guard', require: { hasTag: 'env:prod' }, onFail: 'drop' }, { kind: 'external', codeRef })
const adapterNode = (id: string, className: string, at: [number, number], extra: Partial<NodeInput> = {}) =>
  skinned('ports-and-adapters', node(id, className, at, { type: 'pass' }, { codeRef: className, ...extra }))

export default defineLevel({
  id: 'ports-and-adapters',
  order: 18,
  chapter: 'architecture',
  targetPattern: 'ports-and-adapters',
  circuit: {
    nodes: [
      actor('web', [0, 2]),
      node('core', 'OrderService', [3, 2], { type: 'pass' }, { codeRef: 'OrderService#place' }),
      external('postgres', 'PG', [7, 2], 'Postgres'),
      external('stripe', 'Stripe', [11, 2], 'Stripe'),
      node('confirm', 'Receipt', [16, 2], { type: 'sink' }, { codeRef: 'Receipt#confirm' }),
    ],
    wires: chain('web', 'core', 'postgres', 'stripe', 'confirm'),
  },
  sockets: [
    {
      id: 'dependencies',
      at: 'core',
      inventory: ['ports-and-adapters', 'adapter', 'facade', 'singleton'],
      options: {
        'ports-and-adapters': {
          outcome: 'solves',
          code: 'ports',
          patch: {
            remove: ['postgres', 'stripe'],
            update: [{ id: 'core', skin: 'ports-and-adapters' }],
            add: {
              nodes: [
                skinned('ports-and-adapters', node('repoPort', 'Port::Repository', [6, 2], { type: 'slot' }, { codeRef: 'Port::Repository' })),
                adapterNode('memRepo', 'InMemoryOrders', [8.5, 0.5]),
                adapterNode('pgRepo', 'PostgresOrders', [8.5, 3.5], { kind: 'external' }),
                skinned('ports-and-adapters', node('payPort', 'Port::Payments', [11, 2], { type: 'slot' }, { codeRef: 'Port::Payments' })),
                adapterNode('fakePay', 'FakePayments', [13.5, 0.5]),
                adapterNode('stripePay', 'StripePayments', [13.5, 3.5], { kind: 'external' }),
              ],
              wires: [
                abstract('core', 'repoPort'),
                abstract('repoPort', 'memRepo', 'env:test'),
                abstract('repoPort', 'pgRepo', 'env:prod'),
                wire('memRepo', 'payPort'),
                wire('pgRepo', 'payPort'),
                abstract('payPort', 'fakePay', 'env:test'),
                abstract('payPort', 'stripePay', 'env:prod'),
                wire('fakePay', 'confirm'),
                wire('stripePay', 'confirm'),
              ],
            },
          },
        },
        adapter: {
          outcome: 'partial',
          code: 'adapter',
          patch: {
            removeWires: ['postgres->stripe'],
            add: {
              nodes: [skinned('adapter', node('stripeAdapter', 'StripeAdapter', [9, 0.5], { type: 'pass' }, { codeRef: 'StripeAdapter' }))],
              wires: chain('postgres', 'stripeAdapter', 'stripe'),
            },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          patch: {
            removeWires: ['core->postgres'],
            add: {
              nodes: [skinned('facade', node('infra', 'Infrastructure', [5, 0.5], { type: 'pass' }, { codeRef: 'Infrastructure' }))],
              wires: chain('core', 'infra', 'postgres'),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          patch: { update: [{ id: 'postgres', skin: 'singleton', codeRef: 'Database.instance' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, ['env:test'], {}, 'web'), pulse(40, ['env:test'], {}, 'web'), pulse(80, ['env:prod'], {}, 'web')],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base: code(base), ports: code(ports), adapter: code(base + adapter), facade: code(base + facade), singleton: code(base + singleton) }, ts: { base: codeTs(tsBase), ports: codeTs(tsPorts), adapter: codeTs(tsBase + tsAdapter), facade: codeTs(tsBase + tsFacade), singleton: codeTs(tsBase + tsSingleton) } },
})
