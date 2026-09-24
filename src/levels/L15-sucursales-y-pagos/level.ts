import { defineLevel, type NodeInput, type Predicate } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
// Un nivel de combinación reutiliza el código de los niveles donde se aprendió cada patrón.
import cobrarBase from '../L01-strategy/base.rb?raw'
import cobrarDecorator from '../L01-strategy/decorator.rb?raw'
import cobrarObserver from '../L01-strategy/observer.rb?raw'
import cobrarStrategy from '../L01-strategy/strategy.rb?raw'
import crearBase from '../L02-factory-method/base.rb?raw'
import crearBuilder from '../L02-factory-method/builder.rb?raw'
import common from '../L02-factory-method/common.rb?raw'
import crearFactory from '../L02-factory-method/factory.rb?raw'
import crearSingleton from '../L02-factory-method/singleton.rb?raw'

const MENU: Record<string, string> = { centro: 'latte', playa: 'frappe', montana: 'chocolate' }
const rightDrink: Predicate = { any: Object.entries(MENU).map(([branch, drink]) => ({ all: [{ hasTag: branch }, { hasTag: `made:${drink}` }] })) }

const product = (id: string, label: string, className: string, drink: string, y: number): NodeInput =>
  node(id, label, className, [9, y], { type: 'transform', addTags: [`made:${drink}`], setShape: 'diamond' })

const BRANCHES = [
  { key: 'centro', id: 'sucCentro', label: 'Centro', className: 'CentroBranch', drink: 'latte', y: 0 },
  { key: 'playa', id: 'sucPlaya', label: 'Playa', className: 'PlayaBranch', drink: 'frappe', y: 2 },
  { key: 'montana', id: 'sucMontana', label: 'Montaña', className: 'MontanaBranch', drink: 'chocolate', y: 4 },
]
const PAYMENTS = [
  { key: 'cash', id: 'pagoEfectivo', label: 'Efectivo', className: 'CashPayment', y: 0 },
  { key: 'card', id: 'pagoTarjeta', label: 'Tarjeta', className: 'CardPayment', y: 2 },
  { key: 'voucher', id: 'pagoVale', label: 'Vale', className: 'VoucherPayment', y: 4 },
]
const paymentNode = (p: (typeof PAYMENTS)[number], skin: 'strategy' | 'observer') =>
  skinned(skin, node(p.id, p.label, p.className, [14.5, p.y], { type: 'pass' }, { codeRef: `${p.className}#charge` }))

const order = (at: number, branch: string, payment: string, label: string) => pulse(at, label, [branch, payment], { branch, payment })

export default defineLevel({
  id: 'L15-sucursales-y-pagos',
  order: 15,
  chapter: 'todo-junto',
  title: 'Sucursales y pagos',
  brief: {
    problem: 'Dos problemas conocidos en el mismo circuito: el flujo compartido le da lattes a Montaña, y Cobrar pierde los pagos con vale. Cada uno está en un punto de variación distinto.',
    goal: 'Resolver los dos sockets: cada sucursal su bebida y cada método de pago su cartucho.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('crear', 'Crear bebida', 'OrderFlow', [6, 2], { type: 'branch', cases: { centro: 'latte', playa: 'frappe' }, else: 'latte' }, { codeRef: 'OrderFlow#create_drink' }),
      product('frappe', 'Frappé', 'Frappe', 'frappe', 1),
      product('latte', 'Latte', 'Latte', 'latte', 3),
      node('cobrar', 'Cobrar', 'Cashier', [12, 2], { type: 'branch', cases: { cash: 'out', card: 'out' }, else: 'drop' }, { codeRef: 'Cashier#charge' }),
      node('preparar', 'Preparar', 'Barista', [17, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [20, 2], { type: 'sink', expects: rightDrink }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      ...chain('cliente', 'tomar', 'crear'),
      wire('crear', 'frappe', { port: 'frappe' }),
      wire('crear', 'latte', { port: 'latte' }),
      wire('frappe', 'cobrar'),
      wire('latte', 'cobrar'),
      ...chain('cobrar', 'preparar', 'entregar'),
    ],
  },
  sockets: [
    {
      id: 'crear-bebida',
      at: 'crear',
      label: 'Crear bebida',
      code: 'crear_base',
      inventory: ['factory-method', 'singleton', 'builder'],
      options: {
        'factory-method': {
          outcome: 'solves',
          code: 'crear_factory',
          note: {
            title: 'Factory Method decide qué se crea',
            body: 'Cada sucursal es una subclase con su propio molde. Convive sin problema con Strategy: uno responde "qué objeto crear", el otro "cómo hacer algo con él".',
          },
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'crear', label: 'Sucursal', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map((b) =>
                skinned('factory-method', node(b.id, b.label, b.className, [9, b.y], { type: 'transform', addTags: [`made:${b.drink}`], setShape: 'diamond' }, { codeRef: `${b.className}#create_drink` })),
              ),
              wires: BRANCHES.flatMap((b) => [abstract('crear', b.id, b.key), wire(b.id, 'cobrar')]),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'crear_singleton',
          note: { title: 'Singleton: todas las sucursales reciben lo mismo', body: 'Una fábrica única no sabe de qué sucursal viene cada pedido. La creación tenía que variar, no compartirse.' },
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'crear', label: 'Fábrica única', className: 'DrinkFactory', behavior: { type: 'transform', addTags: ['made:latte'], setShape: 'diamond' }, codeRef: 'DrinkFactory#create', skin: 'singleton' }],
            add: { wires: [wire('crear', 'cobrar')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'crear_builder',
          note: { title: 'Builder arma, no elige la clase', body: 'Armar la bebida por pasos no cambia que el if del flujo compartido siga eligiendo mal para Montaña.' },
          patch: {
            removeWires: ['tomar->crear'],
            add: {
              nodes: [
                skinned('builder', node('bTamano', 'Tamaño', 'DrinkBuilder', [4, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#size' })),
                skinned('builder', node('bTemp', 'Temperatura', 'DrinkBuilder', [6, 0], { type: 'pass' }, { codeRef: 'DrinkBuilder#temperature' })),
              ],
              wires: chain('tomar', 'bTamano', 'bTemp', 'crear'),
            },
          },
        },
      },
    },
    {
      id: 'metodo-de-pago',
      at: 'cobrar',
      label: 'Método de pago',
      code: 'cobrar_base',
      inventory: ['strategy', 'observer', 'decorator'],
      options: {
        strategy: {
          outcome: 'solves',
          code: 'cobrar_strategy',
          note: {
            title: 'Strategy decide cómo se cobra',
            body: 'Cada forma de pago es un cartucho intercambiable. No le importa qué fábrica creó la bebida: los patrones se combinan porque cada uno atiende su propio punto de variación.',
          },
          patch: {
            update: [{ id: 'cobrar', behavior: { type: 'slot' }, skin: 'strategy' }],
            removeWires: ['cobrar->preparar'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'strategy')), wires: PAYMENTS.flatMap((p) => [abstract('cobrar', p.id, p.key), wire(p.id, 'preparar')]) },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'cobrar_observer',
          note: { title: 'Observer cobra en todos lados', body: 'Avisar a todos los métodos de pago hace que cada uno cobre el mismo pedido.' },
          patch: {
            update: [{ id: 'cobrar', behavior: { type: 'broadcast' }, skin: 'observer' }],
            removeWires: ['cobrar->preparar'],
            add: { nodes: PAYMENTS.map((p) => paymentNode(p, 'observer')), wires: PAYMENTS.flatMap((p) => [abstract('cobrar', p.id), wire(p.id, 'preparar')]) },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'cobrar_decorator',
          note: { title: 'Decorator envuelve, no elige', body: 'El pedido sale envuelto de Cobrar, pero el vale ya se perdió en el árbol de if.' },
          patch: {
            removeWires: ['cobrar->preparar'],
            add: {
              nodes: [skinned('decorator', node('envoltura', 'Envoltura', 'TrackedOrder', [14.5, 2], { type: 'transform', addTags: ['tracked'] }))],
              wires: chain('cobrar', 'envoltura', 'preparar'),
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [order(0, 'centro', 'cash', 'Centro · efectivo'), order(45, 'playa', 'card', 'Playa · tarjeta'), order(90, 'montana', 'voucher', 'Montaña · vale'), order(135, 'montana', 'card', 'Montaña · tarjeta')],
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
      crear_base: crearBase,
      crear_factory: crearFactory,
      crear_singleton: crearSingleton,
      crear_builder: crearBuilder,
      cobrar_base: cobrarBase,
      cobrar_strategy: cobrarStrategy,
      cobrar_observer: cobrarObserver,
      cobrar_decorator: cobrarDecorator,
    },
  },
})
