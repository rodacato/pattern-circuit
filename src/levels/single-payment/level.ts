import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import factory from './factory.rb?raw'
import simple from './simple.rb?raw'
import strategy from './strategy.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyFactory from './py/factory.py?raw'
import pySimple from './py/simple.py?raw'
import pyStrategy from './py/strategy.py?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFactory from './ts/factory.ts?raw'
import tsSimple from './ts/simple.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const PIECES = 5 // the pieces the circuit already has: fixing the charge needs no more

export default defineLevel({
  id: 'single-payment',
  order: 24,
  chapter: 'judgment',
  targetPattern: 'keep-simple',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('take', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('charge', 'Cashier', [6, 2], { type: 'transform', addTags: ['double-vat'] }, { codeRef: 'Cashier#charge' }),
      node('prepare', 'Barista', [10, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [13, 2], { type: 'sink', expects: { not: { hasTag: 'double-vat' } } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'take', 'charge', 'prepare', 'handOver'),
  },
  sockets: [
    {
      id: 'charging',
      at: 'charge',
      inventory: ['strategy', 'keep-simple', 'factory-method'],
      options: {
        'keep-simple': {
          outcome: 'solves',
          code: 'simple',
          patch: { update: [{ id: 'charge', behavior: { type: 'pass' }, skin: 'keep-simple' }] },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          patch: {
            removeWires: ['charge->prepare'],
            update: [{ id: 'charge', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: {
              nodes: [skinned('strategy', node('card', 'CardPayment', [8, 0], { type: 'pass' }, { codeRef: 'CardPayment#charge' }))],
              wires: [abstract('charge', 'card', 'card-only'), wire('card', 'prepare', { dep: 'concrete' })],
            },
          },
        },
        'factory-method': {
          outcome: 'misfit',
          code: 'factory',
          patch: {
            removeWires: ['take->charge'],
            update: [{ id: 'charge', behavior: { type: 'pass' } }],
            add: {
              nodes: [skinned('factory-method', node('factory', 'PaymentFactory', [4.5, 0], { type: 'pass' }, { codeRef: 'PaymentFactory#create' }))],
              wires: [wire('take', 'factory', { dep: 'concrete' }), wire('factory', 'charge', { dep: 'concrete' })],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, ['card-only']), pulse(40, ['card-only']), pulse(80, ['card-only'])] }],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'invalidAtSink', op: '==', value: 0, label: '' },
    { metric: 'nodes', op: '<=', value: PIECES },
  ],
  code: {
    rb: { base: code(base), simple: code(simple), strategy: code(strategy), factory: code(factory) },
    ts: { base: codeTs(tsBase), simple: codeTs(tsSimple), strategy: codeTs(tsStrategy), factory: codeTs(tsFactory) },
    py: { base: codePy(pyBase), simple: codePy(pySimple), strategy: codePy(pyStrategy), factory: codePy(pyFactory) },
  },
})
