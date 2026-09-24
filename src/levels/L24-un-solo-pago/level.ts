import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import factory from './factory.rb?raw'
import simple from './simple.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFactory from './ts/factory.ts?raw'
import tsSimple from './ts/simple.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const PIECES = 5 // las piezas que ya tiene el circuito: arreglar el cobro no necesita más

export default defineLevel({
  id: 'L24-un-solo-pago',
  order: 24,
  chapter: 'criterio',
  title: 'Un solo método de pago',
  targetPattern: 'keep-simple',
  brief: {
    problem: 'La cafetería del aeropuerto solo acepta tarjeta, y así seguirá: el contrato con el banco es por años. Cobrar suma el IVA dos veces y alguien propone meter un Strategy de pagos "por si acaso".',
    goal: 'Que cada cobro salga bien sin agregar piezas que hoy nadie necesita.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('cobrar', 'Cobrar', 'Cashier', [6, 2], { type: 'transform', addTags: ['iva-doble'] }, { codeRef: 'Cashier#charge' }),
      node('preparar', 'Preparar', 'Barista', [10, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [13, 2], { type: 'sink', expects: { not: { hasTag: 'iva-doble' } } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('cliente', 'tomar', 'cobrar', 'preparar', 'entregar'),
  },
  sockets: [
    {
      id: 'cobro',
      at: 'cobrar',
      label: 'Cobro',
      inventory: ['strategy', 'keep-simple', 'factory-method'],
      options: {
        'keep-simple': {
          outcome: 'solves',
          code: 'simple',
          note: {
            title: 'Mantenerlo simple: arreglar el cálculo y nada más',
            body: 'Hay un solo método de pago y ninguno más a la vista: el arreglo es una línea en Cashier. Si mañana llega un segundo método, ese será el momento de refactorizar hacia Strategy, no antes.',
          },
          patch: { update: [{ id: 'cobrar', behavior: { type: 'pass' }, skin: 'keep-simple' }] },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy sin alternativas',
            body: 'Una interfaz, un registro y una sola implementación. Funciona, pero es complejidad que hay que cargar en cada cambio sin que nada la pida hoy: lo que Fowler llama el costo de cargar (YAGNI).',
          },
          patch: {
            removeWires: ['cobrar->preparar'],
            update: [{ id: 'cobrar', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: {
              nodes: [skinned('strategy', node('tarjeta', 'Tarjeta', 'CardPayment', [8, 0], { type: 'pass' }, { codeRef: 'CardPayment#charge' }))],
              wires: [abstract('cobrar', 'tarjeta', 'tarjeta'), wire('tarjeta', 'preparar', { dep: 'concrete' })],
            },
          },
        },
        'factory-method': {
          outcome: 'misfit',
          code: 'factory',
          note: {
            title: 'Una fábrica para un solo producto',
            body: 'Factory Method deja que una subclase decida qué crear; aquí siempre se crea lo mismo. GoF advierte que un patrón suma indirección y solo conviene cuando la flexibilidad que da hace falta.',
          },
          patch: {
            removeWires: ['tomar->cobrar'],
            update: [{ id: 'cobrar', behavior: { type: 'pass' } }],
            add: {
              nodes: [skinned('factory-method', node('fabrica', 'Fábrica de pagos', 'PaymentFactory', [4.5, 0], { type: 'pass' }, { codeRef: 'PaymentFactory#create' }))],
              wires: [wire('tomar', 'fabrica', { dep: 'concrete' }), wire('fabrica', 'cobrar', { dep: 'concrete' })],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Latte', ['tarjeta']), pulse(40, 'Americano', ['tarjeta']), pulse(80, 'Té', ['tarjeta'])] }],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'invalidAtSink', op: '==', value: 0, label: 'cobros con el IVA doble' },
    { metric: 'nodes', op: '<=', value: PIECES },
  ],
  code: {
    rb: { base: code(base), simple: code(simple), strategy: code(strategy), factory: code(factory) },
    ts: { base: codeTs(tsBase), simple: codeTs(tsSimple), strategy: codeTs(tsStrategy), factory: codeTs(tsFactory) },
  },
})
