import { defineLevel, type NodeInput } from '../../engine'
import { actor, chain, node, pulse, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import nullObject from './null_object.rb?raw'
import proxy from './proxy.rb?raw'
import pyAdapter from './py/adapter.py?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyDecorator from './py/decorator.py?raw'
import pyNullObject from './py/null_object.py?raw'
import pyProxy from './py/proxy.py?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsNullObject from './ts/null_object.ts?raw'
import tsProxy from './ts/proxy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const usesCard = (id: string, className: string, codeRef: string, x: number): NodeInput =>
  node(id, className, [x, 2], { type: 'guard', require: { not: { hasTag: 'card:nil' } }, onFail: 'drop' }, { codeRef })

const customers = [
  pulse(0, ['card:ok']),
  pulse(35, ['card:nil']),
  pulse(70, ['card:ok']),
  pulse(105, ['card:nil']),
]

export default defineLevel({
  id: 'null-object',
  order: 21,
  chapter: 'resilience',
  targetPattern: 'null-object',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('lookup', 'LoyaltyCards', [3, 2], { type: 'pass' }, { codeRef: 'LoyaltyCards#find' }),
      usesCard('loyalty', 'Loyalty', 'Loyalty#reward', 6),
      usesCard('discount', 'Discounts', 'Discounts#apply', 9),
      usesCard('receipt', 'Receipt', 'Receipt#print', 12),
      node('handOver', 'Counter', [15, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'lookup', 'loyalty', 'discount', 'receipt', 'handOver'),
  },
  sockets: [
    {
      id: 'card',
      at: 'lookup',
      inventory: ['null-object', 'decorator', 'proxy', 'adapter'],
      options: {
        'null-object': {
          outcome: 'solves',
          code: 'null_object',
          patch: {
            update: [{ id: 'lookup', behavior: { type: 'transform', when: { hasTag: 'card:nil' }, removeTags: ['card:nil'], addTags: ['card:null'] }, skin: 'null-object' }],
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          patch: { update: [{ id: 'lookup', skin: 'decorator' }] },
        },
        proxy: {
          outcome: 'misfit',
          code: 'proxy',
          patch: { update: [{ id: 'lookup', skin: 'proxy' }] },
        },
        adapter: {
          outcome: 'misfit',
          code: 'adapter',
          patch: { update: [{ id: 'lookup', skin: 'adapter' }] },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: customers }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'dropped', op: '==', value: 0, label: '' },
  ],
  code: { rb: { base: code(base), null_object: code(nullObject), decorator: code(base + decorator), proxy: code(base + proxy), adapter: code(base + adapter) }, ts: { base: codeTs(tsBase), null_object: codeTs(tsNullObject), decorator: codeTs(tsBase + tsDecorator), proxy: codeTs(tsBase + tsProxy), adapter: codeTs(tsBase + tsAdapter) }, py: { base: codePy(pyBase), null_object: codePy(pyNullObject), decorator: codePy(pyBase + pyDecorator), proxy: codePy(pyBase + pyProxy), adapter: codePy(pyBase + pyAdapter) } },
})
