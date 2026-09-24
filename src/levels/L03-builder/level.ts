import { defineLevel, type NodeDef, type Predicate } from '../../engine'
import base from './base.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import { withCommon } from '../kit'
import decorator from './decorator.rb?raw'
import factory from './factory.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBuilder from './ts/builder.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsFactory from './ts/factory.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)

const impossible: Predicate = { all: [{ hasTag: 'caliente' }, { hasTag: 'hielo' }] }

const station = (id: string, label: string, codeRef: string, x: number, behavior: NodeDef['behavior'] = { type: 'pass' }): NodeDef => ({
  id,
  label,
  className: 'OrderBuilder',
  kind: 'class',
  at: [x, 0],
  behavior,
  codeRef,
  skin: 'builder',
})

// Los argumentos cruzados se arreglan en cuanto cada dato tiene nombre propio.
const fixCrossedArgs: NodeDef['behavior'] = { type: 'transform', when: { hasTag: 'args-cruzados' }, removeTags: ['args-cruzados'] }

export default defineLevel({
  id: 'L03-builder',
  order: 3,
  chapter: 'mostrador',
  title: 'Pedido a la medida',
  targetPattern: 'builder',
  brief: {
    problem: 'Pedido.new recibe nueve argumentos en orden. Un latte sale con la leche donde iba el jarabe, y un pedido imposible (caliente y con hielo) se cobra y explota en la cocina.',
    goal: 'Que cada pedido personalizado salga bien y que lo imposible se detecte antes de cobrar.',
  },
  circuit: {
    nodes: [
      { id: 'cliente', label: 'Cliente', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'tomar', label: 'Tomar pedido', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'pedido',
        label: 'Crear pedido',
        className: 'Order',
        at: [6, 2],
        behavior: { type: 'transform', when: { hasTag: 'args-cruzados' }, addTags: ['leche-en-jarabe'] },
        codeRef: 'Order#initialize',
      },
      { id: 'cobrar', label: 'Cobrar', className: 'Cashier', at: [10, 2], behavior: { type: 'pass' }, codeRef: 'Cashier#charge' },
      {
        id: 'preparar',
        label: 'Preparar',
        className: 'Barista',
        at: [13, 2],
        behavior: { type: 'guard', require: { not: impossible }, onFail: 'drop' },
        codeRef: 'Barista#prepare',
      },
      {
        id: 'entregar',
        label: 'Entregar',
        className: 'Counter',
        at: [16, 2],
        behavior: { type: 'sink', expects: { not: { hasTag: 'leche-en-jarabe' } } },
        codeRef: 'Counter#hand_over',
      },
    ],
    wires: [
      { from: 'cliente', to: 'tomar' },
      { from: 'tomar', to: 'pedido' },
      { from: 'pedido', to: 'cobrar' },
      { from: 'cobrar', to: 'preparar' },
      { from: 'preparar', to: 'entregar' },
    ],
  },
  sockets: [
    {
      id: 'crear-pedido',
      at: 'pedido',
      label: 'Crear pedido',
      inventory: ['builder', 'factory-method', 'decorator'],
      options: {
        builder: {
          outcome: 'solves',
          code: 'builder',
          note: {
            title: 'Builder: paso a paso, y valida al final',
            body: 'Cada parte del pedido se fija con un método con nombre, así que no se puede cruzar la leche con el jarabe. Como build() recibe el pedido completo, puede revisarlo antes de crearlo y rechazar lo imposible en el mostrador, antes de cobrar.',
          },
          patch: {
            remove: ['pedido'],
            add: {
              nodes: [
                station('bTamano', 'Tamaño', 'OrderBuilder#size', 4),
                station('bLeche', 'Leche', 'OrderBuilder#milk', 6, fixCrossedArgs),
                station('bExtras', 'Extras', 'OrderBuilder#extras', 8),
                station('build', 'build()', 'OrderBuilder#build', 10, { type: 'guard', require: { not: impossible }, onFail: 'rechazo' }),
                { id: 'avisar', label: 'Avisar al cliente', className: 'Counter', kind: 'class', at: [13, 0], behavior: { type: 'sink', message: '✋ rechazado antes de cobrar' }, codeRef: 'Counter#notify' },
              ],
              wires: [
                { from: 'tomar', to: 'bTamano', port: 'out', dep: 'concrete' },
                { from: 'bTamano', to: 'bLeche', port: 'out', dep: 'concrete' },
                { from: 'bLeche', to: 'bExtras', port: 'out', dep: 'concrete' },
                { from: 'bExtras', to: 'build', port: 'out', dep: 'concrete' },
                { from: 'build', to: 'cobrar', port: 'out', dep: 'concrete' },
                { from: 'build', to: 'avisar', port: 'rechazo', dep: 'concrete' },
              ],
            },
          },
        },
        'factory-method': {
          outcome: 'misfit',
          code: 'factory',
          note: {
            title: 'Factory Method: un molde (una subclase) por combinación',
            body: 'Una fábrica crea productos de catálogo. Un pedido a la medida no está en el catálogo: harían falta cientos de moldes, uno por combinación, y los pedidos sin molde se pierden.',
          },
          patch: {
            remove: ['pedido'],
            add: {
              nodes: [
                { id: 'moldes', label: 'Moldes', className: 'OrderPresets', kind: 'class', at: [6, 2], behavior: { type: 'slot' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'moldeLatte', label: 'Latte grande', className: 'OrderPresets', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'moldeAmericano', label: 'Americano', className: 'OrderPresets', kind: 'class', at: [8, 4], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
              ],
              wires: [
                { from: 'tomar', to: 'moldes', port: 'out', dep: 'concrete' },
                { from: 'moldes', to: 'moldeLatte', key: 'combo:latte-grande', port: 'out', dep: 'abstract' },
                { from: 'moldes', to: 'moldeAmericano', key: 'combo:americano', port: 'out', dep: 'abstract' },
                { from: 'moldeLatte', to: 'cobrar', port: 'out', dep: 'concrete' },
                { from: 'moldeAmericano', to: 'cobrar', port: 'out', dep: 'concrete' },
              ],
            },
          },
        },
        decorator: {
          outcome: 'partial',
          code: 'decorator',
          note: {
            title: 'Decorator: extras con nombre, pero sin revisión final',
            body: 'Envolver el pedido con cada extra evita cruzar la leche con el jarabe. Pero nadie mira el pedido completo antes de cobrar: caliente y con hielo sigue explotando en la cocina.',
          },
          patch: {
            remove: ['pedido'],
            add: {
              nodes: [
                { id: 'conLeche', label: 'Con leche', className: 'WithMilk', kind: 'class', at: [6, 2], behavior: fixCrossedArgs, codeRef: 'WithMilk', skin: 'decorator' },
                { id: 'conJarabe', label: 'Con jarabe', className: 'WithSyrup', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'WithSyrup', skin: 'decorator' },
              ],
              wires: [
                { from: 'tomar', to: 'conLeche', port: 'out', dep: 'concrete' },
                { from: 'conLeche', to: 'conJarabe', port: 'out', dep: 'concrete' },
                { from: 'conJarabe', to: 'cobrar', port: 'out', dep: 'concrete' },
              ],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        { at: 0, from: 'cliente', tags: ['combo:latte-grande'], label: 'Latte grande' },
        { at: 45, from: 'cliente', tags: ['combo:latte-avena-vainilla', 'args-cruzados'], label: 'Latte avena + vainilla' },
        { at: 90, from: 'cliente', tags: ['combo:americano-hielo', 'caliente', 'hielo'], label: 'Americano caliente con hielo' },
      ],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 2 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      builder: code(builder),
      factory: code(factory),
      decorator: code(decorator),
    },
    ts: {
      base: codeTs(tsBase),
      builder: codeTs(tsBuilder),
      factory: codeTs(tsFactory),
      decorator: codeTs(tsDecorator),
    },
  },
})
