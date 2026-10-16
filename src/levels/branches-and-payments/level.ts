import { defineLevel, type NodeInput, type Predicate } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
// A combination level reuses the code from the levels where each pattern was learned.
import chargeBase from '../strategy/base.rb?raw'
import chargeDecorator from '../strategy/decorator.rb?raw'
import chargeObserver from '../strategy/observer.rb?raw'
import chargeStrategy from '../strategy/strategy.rb?raw'
import createBase from '../factory-method/base.rb?raw'
import createBuilder from '../factory-method/builder.rb?raw'
import common from '../factory-method/common.rb?raw'
import createFactory from '../factory-method/factory.rb?raw'
import createSingleton from '../factory-method/singleton.rb?raw'
import pyChargeBase from '../strategy/py/base.py?raw'
import pyChargeDecorator from '../strategy/py/decorator.py?raw'
import pyChargeObserver from '../strategy/py/observer.py?raw'
import pyChargeStrategy from '../strategy/py/strategy.py?raw'
import pyCreateBase from '../factory-method/py/base.py?raw'
import pyCreateBuilder from '../factory-method/py/builder.py?raw'
import pyCommon from '../factory-method/py/common.py?raw'
import pyCreateFactory from '../factory-method/py/factory.py?raw'
import pyCreateSingleton from '../factory-method/py/singleton.py?raw'
import tsChargeBase from '../strategy/ts/base.ts?raw'
import tsChargeDecorator from '../strategy/ts/decorator.ts?raw'
import tsChargeObserver from '../strategy/ts/observer.ts?raw'
import tsChargeStrategy from '../strategy/ts/strategy.ts?raw'
import tsCreateBase from '../factory-method/ts/base.ts?raw'
import tsCreateBuilder from '../factory-method/ts/builder.ts?raw'
import tsCommon from '../factory-method/ts/common.ts?raw'
import tsCreateFactory from '../factory-method/ts/factory.ts?raw'
import tsCreateSingleton from '../factory-method/ts/singleton.ts?raw'

const MENU: Record<string, string> = { downtown: 'latte', beach: 'frappe', mountain: 'chocolate' }
const rightDrink: Predicate = { any: Object.entries(MENU).map(([branch, drink]) => ({ all: [{ hasTag: branch }, { hasTag: `made:${drink}` }] })) }

const product = (id: string, className: string, drink: string, y: number): NodeInput =>
  node(id, className, [9, y], { type: 'transform', addTags: [`made:${drink}`], setShape: 'diamond' })

const BRANCHES = [
  { key: 'downtown', id: 'downtownBranch', className: 'DowntownBranch', drink: 'latte', y: 0 },
  { key: 'beach', id: 'beachBranch', className: 'BeachBranch', drink: 'frappe', y: 2 },
  { key: 'mountain', id: 'mountainBranch', className: 'MountainBranch', drink: 'chocolate', y: 4 },
]
const PAYMENTS = [
  { key: 'cash', id: 'cashPayment', className: 'CashPayment', y: 0 },
  { key: 'card', id: 'cardPayment', className: 'CardPayment', y: 2 },
  { key: 'voucher', id: 'voucherPayment', className: 'VoucherPayment', y: 4 },
]
const paymentNode = (p: (typeof PAYMENTS)[number], skin: 'strategy' | 'observer') =>
  skinned(skin, node(p.id, p.className, [14.5, p.y], { type: 'pass' }, { codeRef: `${p.className}#charge` }))

const order = (at: number, branch: string, payment: string) => pulse(at, [branch, payment], { branch, payment })

export default defineLevel({
  id: 'branches-and-payments',
  order: 15,
  chapter: 'all-together',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('take', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('create', 'OrderFlow', [6, 2], { type: 'branch', cases: { downtown: 'latte', beach: 'frappe' }, else: 'latte' }, { codeRef: 'OrderFlow#create_drink' }),
      product('frappe', 'Frappe', 'frappe', 1),
      product('latte', 'Latte', 'latte', 3),
      node('charge', 'Cashier', [12, 2], { type: 'branch', cases: { cash: 'out', card: 'out' }, else: 'drop' }, { codeRef: 'Cashier#charge' }),
      node('prepare', 'Barista', [17, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [20, 2], { type: 'sink', expects: rightDrink }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      ...chain('customer', 'take', 'create'),
      wire('create', 'frappe', { port: 'frappe' }),
      wire('create', 'latte', { port: 'latte' }),
      wire('frappe', 'charge'),
      wire('latte', 'charge'),
      ...chain('charge', 'prepare', 'handOver'),
    ],
  },
  sockets: [
    {
      id: 'create-drink',
      at: 'create',
      code: 'create_base',
      inventory: ['factory-method', 'singleton', 'builder'],
      options: {
        'factory-method': {
          outcome: 'solves',
          code: 'create_factory',
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'option.create-drink.factory-method.label.create', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map((b) =>
                skinned('factory-method', node(b.id, b.className, [9, b.y], { type: 'transform', addTags: [`made:${b.drink}`], setShape: 'diamond' }, { codeRef: `${b.className}#create_drink` })),
              ),
              wires: BRANCHES.flatMap((b) => [abstract('create', b.id, b.key), wire(b.id, 'charge')]),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'create_singleton',
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'option.create-drink.singleton.label.create', className: 'DrinkFactory', behavior: { type: 'transform', addTags: ['made:latte'], setShape: 'diamond' }, codeRef: 'DrinkFactory#create', skin: 'singleton' }],
            add: { wires: [wire('create', 'charge')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'create_builder',
          patch: {
            removeWires: ['take->create'],
            add: {
              nodes: [
                skinned('builder', node('bSize', 'DrinkBuilder', [4, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#size' })),
                skinned('builder', node('bTemp', 'DrinkBuilder', [6, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#temperature' })),
              ],
              wires: chain('take', 'bSize', 'bTemp', 'create'),
            },
          },
        },
      },
    },
    {
      id: 'payment-method',
      at: 'charge',
      code: 'charge_base',
      inventory: ['strategy', 'observer', 'decorator'],
      options: {
        strategy: {
          outcome: 'solves',
          code: 'charge_strategy',
          patch: {
            update: [{ id: 'charge', behavior: { type: 'slot' }, skin: 'strategy' }],
            removeWires: ['charge->prepare'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'strategy')), wires: PAYMENTS.flatMap((p) => [abstract('charge', p.id, p.key), wire(p.id, 'prepare')]) },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'charge_observer',
          patch: {
            update: [{ id: 'charge', behavior: { type: 'broadcast' }, skin: 'observer' }],
            removeWires: ['charge->prepare'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'observer')), wires: PAYMENTS.flatMap((p) => [abstract('charge', p.id), wire(p.id, 'prepare')]) },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'charge_decorator',
          patch: {
            removeWires: ['charge->prepare'],
            add: {
              nodes: [skinned('decorator', node('wrapper', 'TrackedOrder', [14.5, 2], { type: 'transform', addTags: ['tracked'] }))],
              wires: chain('charge', 'wrapper', 'prepare'),
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [order(0, 'downtown', 'cash'), order(45, 'beach', 'card'), order(90, 'mountain', 'voucher'), order(135, 'mountain', 'card')],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'duplicatesAtSink', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: common,
      create_base: createBase,
      create_factory: createFactory,
      create_singleton: createSingleton,
      create_builder: createBuilder,
      charge_base: chargeBase,
      charge_strategy: chargeStrategy,
      charge_observer: chargeObserver,
      charge_decorator: chargeDecorator,
    },
    ts: {
      base: tsCommon,
      create_base: tsCreateBase,
      create_factory: tsCreateFactory,
      create_singleton: tsCreateSingleton,
      create_builder: tsCreateBuilder,
      charge_base: tsChargeBase,
      charge_strategy: tsChargeStrategy,
      charge_observer: tsChargeObserver,
      charge_decorator: tsChargeDecorator,
    },
    py: {
      base: pyCommon,
      create_base: pyCreateBase,
      create_factory: pyCreateFactory,
      create_singleton: pyCreateSingleton,
      create_builder: pyCreateBuilder,
      charge_base: pyChargeBase,
      charge_strategy: pyChargeStrategy,
      charge_observer: pyChargeObserver,
      charge_decorator: pyChargeDecorator,
    },
  },
})
