import { defineLevel, type NodeInput, type PatternId, type WireInput } from '../../engine'
import baseCashier from './base.rb?raw'
import baseAppCashier from './base_app.rb?raw'
import common from './common.rb?raw'
import decoratorCashier from './decorator.rb?raw'
import observerCashier from './observer.rb?raw'
import strategyCashier from './strategy.rb?raw'
import strategyAppCashier from './strategy_app.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseApp from './ts/base_app.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'
import tsStrategyApp from './ts/strategy_app.ts?raw'
import { withCommon as withCommonCode } from '../kit'

const withCommon = withCommonCode(common)
const withCommonTs = withCommonCode(tsCommon)

const PAYMENTS = [
  { key: 'cash', id: 'cashPayment', className: 'CashPayment', row: 0 },
  { key: 'card', id: 'cardPayment', className: 'CardPayment', row: 2 },
  { key: 'voucher', id: 'voucherPayment', className: 'VoucherPayment', row: 4 },
] as const

const paymentNode = (p: { id: string; className: string; row: number }, skin?: PatternId): NodeInput => ({
  id: p.id,
  className: p.className,
  kind: 'class',
  at: [10, p.row],
  behavior: { type: 'pass' },
  codeRef: `${p.className}#charge`,
  skin,
})

const toBarista = (id: string): WireInput => ({ from: id, to: 'prepare', port: 'out', dep: 'concrete' })

const order = (at: number, payment: string) => ({
  at,
  from: 'customer',
  tags: [payment],
  data: { payment },
  label: '',
})

export default defineLevel({
  id: 'strategy',
  order: 1,
  chapter: 'counter',
  targetPattern: 'strategy',
  circuit: {
    nodes: [
      { id: 'customer', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'charge',
        className: 'Cashier',
        at: [7, 2],
        behavior: { type: 'branch', cases: { cash: 'out', card: 'out' }, else: 'drop' },
        codeRef: 'Cashier#charge',
      },
      { id: 'prepare', className: 'Barista', at: [13, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'handOver', className: 'Counter', at: [16, 2], behavior: { type: 'sink' }, codeRef: 'Counter#hand_over' },
    ],
    wires: [
      { from: 'customer', to: 'take' },
      { from: 'take', to: 'charge' },
      { from: 'charge', to: 'prepare' },
      { from: 'prepare', to: 'handOver' },
    ],
  },
  sockets: [
    {
      id: 'payment-method',
      at: 'charge',
      inventory: ['strategy', 'observer', 'decorator'],
      options: {
        strategy: {
          outcome: 'solves',
          code: 'strategy',
          patch: {
            update: [{ id: 'charge', behavior: { type: 'slot' }, skin: 'strategy' }],
            removeWires: ['charge->prepare'],
            add: {
              nodes: PAYMENTS.map((p) => paymentNode(p, 'strategy')),
              wires: PAYMENTS.flatMap((p) => [
                { from: 'charge', to: p.id, key: p.key, dep: 'abstract' as const },
                toBarista(p.id),
              ]),
            },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          patch: {
            update: [{ id: 'charge', behavior: { type: 'broadcast' }, skin: 'observer' }],
            removeWires: ['charge->prepare'],
            add: {
              nodes: PAYMENTS.map((p) => paymentNode(p, 'observer')),
              wires: PAYMENTS.flatMap((p) => [{ from: 'charge', to: p.id, dep: 'abstract' as const }, toBarista(p.id)]),
            },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          patch: {
            removeWires: ['take->charge'],
            add: {
              nodes: [
                {
                  id: 'wrapper',
                  className: 'TrackedOrder',
                  kind: 'class',
                  at: [5, 2],
                  behavior: { type: 'transform', addTags: ['tracked'] },
                  codeRef: 'TrackedOrder',
                  skin: 'decorator',
                },
              ],
              wires: [
                { from: 'take', to: 'wrapper', port: 'out', dep: 'concrete' },
                { from: 'wrapper', to: 'charge', port: 'out', dep: 'concrete' },
              ],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: [order(0, 'cash'), order(45, 'card'), order(90, 'voucher')] },
    {
      id: 'with-app',
      pulses: [order(0, 'cash'), order(45, 'card'), order(90, 'voucher'), order(135, 'app')],
    },
  ],
  changeTickets: [
    {
      id: 'app-payment',
      scenario: 'with-app',
      without: {
        update: [{ id: 'charge', behavior: { type: 'branch', cases: { cash: 'out', card: 'out', app: 'out' }, else: 'drop' } }],
      },
      with: {
        add: {
          nodes: [paymentNode({ id: 'appPayment', className: 'AppPayment', row: 6 }, 'strategy')],
          wires: [{ from: 'charge', to: 'appPayment', key: 'app', dep: 'abstract' }, toBarista('appPayment')],
        },
      },
      code: { without: 'base_app', with: 'strategy_app' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'duplicatesAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: withCommon(baseCashier),
      base_app: withCommon(baseAppCashier),
      strategy: withCommon(strategyCashier),
      strategy_app: withCommon(strategyAppCashier),
      observer: withCommon(observerCashier),
      decorator: withCommon(decoratorCashier),
    },
    ts: {
      base: withCommonTs(tsBase),
      base_app: withCommonTs(tsBaseApp),
      strategy: withCommonTs(tsStrategy),
      strategy_app: withCommonTs(tsStrategyApp),
      observer: withCommonTs(tsObserver),
      decorator: withCommonTs(tsDecorator),
    },
  },
})
