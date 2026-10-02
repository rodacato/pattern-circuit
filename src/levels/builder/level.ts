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

const impossible: Predicate = { all: [{ hasTag: 'hot' }, { hasTag: 'ice' }] }

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

// Crossed arguments get fixed as soon as each piece of data has its own name.
const fixCrossedArgs: NodeDef['behavior'] = { type: 'transform', when: { hasTag: 'crossed-args' }, removeTags: ['crossed-args'] }

export default defineLevel({
  id: 'builder',
  order: 3,
  chapter: 'counter',
  title: 'Pedido a la medida',
  targetPattern: 'builder',
  brief: {
    problem: 'Pedido.new recibe nueve argumentos en orden. Un latte sale con la leche donde iba el jarabe, y un pedido imposible (caliente y con hielo) se cobra y explota en la cocina.',
    goal: 'Que cada pedido personalizado salga bien y que lo imposible se detecte antes de cobrar.',
  },
  circuit: {
    nodes: [
      { id: 'customer', label: 'Cliente', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', label: 'Tomar pedido', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'order',
        label: 'Crear pedido',
        className: 'Order',
        at: [6, 2],
        behavior: { type: 'transform', when: { hasTag: 'crossed-args' }, addTags: ['milk-in-syrup'] },
        codeRef: 'Order#initialize',
      },
      { id: 'charge', label: 'Cobrar', className: 'Cashier', at: [10, 2], behavior: { type: 'pass' }, codeRef: 'Cashier#charge' },
      {
        id: 'prepare',
        label: 'Preparar',
        className: 'Barista',
        at: [13, 2],
        behavior: { type: 'guard', require: { not: impossible }, onFail: 'drop' },
        codeRef: 'Barista#prepare',
      },
      {
        id: 'handOver',
        label: 'Entregar',
        className: 'Counter',
        at: [16, 2],
        behavior: { type: 'sink', expects: { not: { hasTag: 'milk-in-syrup' } } },
        codeRef: 'Counter#hand_over',
      },
    ],
    wires: [
      { from: 'customer', to: 'take' },
      { from: 'take', to: 'order' },
      { from: 'order', to: 'charge' },
      { from: 'charge', to: 'prepare' },
      { from: 'prepare', to: 'handOver' },
    ],
  },
  sockets: [
    {
      id: 'create-order',
      at: 'order',
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
            remove: ['order'],
            add: {
              nodes: [
                station('bSize', 'Tamaño', 'OrderBuilder#size', 4),
                station('bMilk', 'Leche', 'OrderBuilder#milk', 6, fixCrossedArgs),
                station('bExtras', 'Extras', 'OrderBuilder#extras', 8),
                station('build', 'build()', 'OrderBuilder#build', 10, { type: 'guard', require: { not: impossible }, onFail: 'reject' }),
                { id: 'notify', label: 'Avisar al cliente', className: 'Counter', kind: 'class', at: [13, 0], behavior: { type: 'sink', message: '✋ rechazado antes de cobrar' }, codeRef: 'Counter#notify' },
              ],
              wires: [
                { from: 'take', to: 'bSize', port: 'out', dep: 'concrete' },
                { from: 'bSize', to: 'bMilk', port: 'out', dep: 'concrete' },
                { from: 'bMilk', to: 'bExtras', port: 'out', dep: 'concrete' },
                { from: 'bExtras', to: 'build', port: 'out', dep: 'concrete' },
                { from: 'build', to: 'charge', port: 'out', dep: 'concrete' },
                { from: 'build', to: 'notify', port: 'reject', dep: 'concrete' },
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
            remove: ['order'],
            add: {
              nodes: [
                { id: 'presets', label: 'Moldes', className: 'OrderPresets', kind: 'class', at: [6, 2], behavior: { type: 'slot' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'lattePreset', label: 'Latte grande', className: 'OrderPresets', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'americanoPreset', label: 'Americano', className: 'OrderPresets', kind: 'class', at: [8, 4], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
              ],
              wires: [
                { from: 'take', to: 'presets', port: 'out', dep: 'concrete' },
                { from: 'presets', to: 'lattePreset', key: 'combo:large-latte', port: 'out', dep: 'abstract' },
                { from: 'presets', to: 'americanoPreset', key: 'combo:americano', port: 'out', dep: 'abstract' },
                { from: 'lattePreset', to: 'charge', port: 'out', dep: 'concrete' },
                { from: 'americanoPreset', to: 'charge', port: 'out', dep: 'concrete' },
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
            remove: ['order'],
            add: {
              nodes: [
                { id: 'withMilk', label: 'Con leche', className: 'WithMilk', kind: 'class', at: [6, 2], behavior: fixCrossedArgs, codeRef: 'WithMilk', skin: 'decorator' },
                { id: 'withSyrup', label: 'Con jarabe', className: 'WithSyrup', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'WithSyrup', skin: 'decorator' },
              ],
              wires: [
                { from: 'take', to: 'withMilk', port: 'out', dep: 'concrete' },
                { from: 'withMilk', to: 'withSyrup', port: 'out', dep: 'concrete' },
                { from: 'withSyrup', to: 'charge', port: 'out', dep: 'concrete' },
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
        { at: 0, from: 'customer', tags: ['combo:large-latte'], label: 'Latte grande' },
        { at: 45, from: 'customer', tags: ['combo:oat-vanilla-latte', 'crossed-args'], label: 'Latte avena + vainilla' },
        { at: 90, from: 'customer', tags: ['combo:iced-americano', 'hot', 'ice'], label: 'Americano caliente con hielo' },
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
