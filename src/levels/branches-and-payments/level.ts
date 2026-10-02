import { defineLevel, type NodeInput, type Predicate } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
// Un nivel de combinación reutiliza el código de los niveles donde se aprendió cada patrón.
import chargeBase from '../strategy/base.rb?raw'
import chargeDecorator from '../strategy/decorator.rb?raw'
import chargeObserver from '../strategy/observer.rb?raw'
import chargeStrategy from '../strategy/strategy.rb?raw'
import createBase from '../factory-method/base.rb?raw'
import createBuilder from '../factory-method/builder.rb?raw'
import common from '../factory-method/common.rb?raw'
import createFactory from '../factory-method/factory.rb?raw'
import createSingleton from '../factory-method/singleton.rb?raw'
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

const product = (id: string, label: string, className: string, drink: string, y: number): NodeInput =>
  node(id, label, className, [9, y], { type: 'transform', addTags: [`made:${drink}`], setShape: 'diamond' })

const BRANCHES = [
  { key: 'downtown', id: 'downtownBranch', label: 'Centro', className: 'DowntownBranch', drink: 'latte', y: 0 },
  { key: 'beach', id: 'beachBranch', label: 'Playa', className: 'BeachBranch', drink: 'frappe', y: 2 },
  { key: 'mountain', id: 'mountainBranch', label: 'Montaña', className: 'MountainBranch', drink: 'chocolate', y: 4 },
]
const PAYMENTS = [
  { key: 'cash', id: 'cashPayment', label: 'Efectivo', className: 'CashPayment', y: 0 },
  { key: 'card', id: 'cardPayment', label: 'Tarjeta', className: 'CardPayment', y: 2 },
  { key: 'voucher', id: 'voucherPayment', label: 'Vale', className: 'VoucherPayment', y: 4 },
]
const paymentNode = (p: (typeof PAYMENTS)[number], skin: 'strategy' | 'observer') =>
  skinned(skin, node(p.id, p.label, p.className, [14.5, p.y], { type: 'pass' }, { codeRef: `${p.className}#charge` }))

const order = (at: number, branch: string, payment: string, label: string) => pulse(at, label, [branch, payment], { branch, payment })

export default defineLevel({
  id: 'branches-and-payments',
  order: 15,
  chapter: 'all-together',
  title: 'Sucursales y pagos',
  brief: {
    problem: 'Dos problemas conocidos en el mismo circuito: el flujo compartido le da lattes a Montaña, y Cobrar pierde los pagos con vale. Cada uno está en un punto de variación distinto.',
    goal: 'Resolver los dos sockets: cada sucursal su bebida y cada método de pago su cartucho.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('take', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('create', 'Crear bebida', 'OrderFlow', [6, 2], { type: 'branch', cases: { downtown: 'latte', beach: 'frappe' }, else: 'latte' }, { codeRef: 'OrderFlow#create_drink' }),
      product('frappe', 'Frappé', 'Frappe', 'frappe', 1),
      product('latte', 'Latte', 'Latte', 'latte', 3),
      node('charge', 'Cobrar', 'Cashier', [12, 2], { type: 'branch', cases: { cash: 'out', card: 'out' }, else: 'drop' }, { codeRef: 'Cashier#charge' }),
      node('prepare', 'Preparar', 'Barista', [17, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Entregar', 'Counter', [20, 2], { type: 'sink', expects: rightDrink }, { codeRef: 'Counter#hand_over' }),
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
      label: 'Crear bebida',
      code: 'create_base',
      inventory: ['factory-method', 'singleton', 'builder'],
      options: {
        'factory-method': {
          outcome: 'solves',
          code: 'create_factory',
          note: {
            title: 'Factory Method decide qué se crea',
            body: 'Cada sucursal es una subclase con su propio molde. Convive sin problema con Strategy: uno responde "qué objeto crear", el otro "cómo hacer algo con él".',
          },
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'Sucursal', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map((b) =>
                skinned('factory-method', node(b.id, b.label, b.className, [9, b.y], { type: 'transform', addTags: [`made:${b.drink}`], setShape: 'diamond' }, { codeRef: `${b.className}#create_drink` })),
              ),
              wires: BRANCHES.flatMap((b) => [abstract('create', b.id, b.key), wire(b.id, 'charge')]),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'create_singleton',
          note: { title: 'Singleton: todas las sucursales reciben lo mismo', body: 'Una fábrica única no sabe de qué sucursal viene cada pedido. La creación tenía que variar, no compartirse.' },
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'Fábrica única', className: 'DrinkFactory', behavior: { type: 'transform', addTags: ['made:latte'], setShape: 'diamond' }, codeRef: 'DrinkFactory#create', skin: 'singleton' }],
            add: { wires: [wire('create', 'charge')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'create_builder',
          note: { title: 'Builder arma, no elige la clase', body: 'Armar la bebida por pasos no cambia que el if del flujo compartido siga eligiendo mal para Montaña.' },
          patch: {
            removeWires: ['take->create'],
            add: {
              nodes: [
                skinned('builder', node('bSize', 'Tamaño', 'DrinkBuilder', [4, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#size' })),
                skinned('builder', node('bTemp', 'Temperatura', 'DrinkBuilder', [6, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#temperature' })),
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
      label: 'Método de pago',
      code: 'charge_base',
      inventory: ['strategy', 'observer', 'decorator'],
      options: {
        strategy: {
          outcome: 'solves',
          code: 'charge_strategy',
          note: {
            title: 'Strategy decide cómo se cobra',
            body: 'Cada forma de pago es un cartucho intercambiable. No le importa qué fábrica creó la bebida: los patrones se combinan porque cada uno atiende su propio punto de variación.',
          },
          patch: {
            update: [{ id: 'charge', behavior: { type: 'slot' }, skin: 'strategy' }],
            removeWires: ['charge->prepare'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'strategy')), wires: PAYMENTS.flatMap((p) => [abstract('charge', p.id, p.key), wire(p.id, 'prepare')]) },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'charge_observer',
          note: { title: 'Observer cobra en todos lados', body: 'Avisar a todos los métodos de pago hace que cada uno cobre el mismo pedido.' },
          patch: {
            update: [{ id: 'charge', behavior: { type: 'broadcast' }, skin: 'observer' }],
            removeWires: ['charge->prepare'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'observer')), wires: PAYMENTS.flatMap((p) => [abstract('charge', p.id), wire(p.id, 'prepare')]) },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'charge_decorator',
          note: { title: 'Decorator envuelve, no elige', body: 'El pedido sale envuelto de Cobrar, pero el vale ya se perdió en el árbol de if.' },
          patch: {
            removeWires: ['charge->prepare'],
            add: {
              nodes: [skinned('decorator', node('wrapper', 'Envoltura', 'TrackedOrder', [14.5, 2], { type: 'transform', addTags: ['tracked'] }))],
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
      pulses: [order(0, 'downtown', 'cash', 'Centro · efectivo'), order(45, 'beach', 'card', 'Playa · tarjeta'), order(90, 'mountain', 'voucher', 'Montaña · vale'), order(135, 'mountain', 'card', 'Montaña · tarjeta')],
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
  },
})
