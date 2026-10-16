import { defineLevel, type NodeInput, type Predicate } from '../../engine'
import base from './base.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import { withCommon } from '../kit'
import decorator from './decorator.rb?raw'
import factory from './factory.rb?raw'
import pyBase from './py/base.py?raw'
import pyBuilder from './py/builder.py?raw'
import pyCommon from './py/common.py?raw'
import pyDecorator from './py/decorator.py?raw'
import pyFactory from './py/factory.py?raw'
import tsBase from './ts/base.ts?raw'
import tsBuilder from './ts/builder.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsFactory from './ts/factory.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)

const impossible: Predicate = { all: [{ hasTag: 'hot' }, { hasTag: 'ice' }] }

const station = (id: string, codeRef: string, x: number, behavior: NodeInput['behavior'] = { type: 'pass' }): NodeInput => ({
  id,
  className: 'OrderBuilder',
  kind: 'class',
  at: [x, 0],
  behavior,
  codeRef,
  skin: 'builder',
})

// Crossed arguments get fixed as soon as each piece of data has its own name.
const fixCrossedArgs: NodeInput['behavior'] = { type: 'transform', when: { hasTag: 'crossed-args' }, removeTags: ['crossed-args'] }

export default defineLevel({
  id: 'builder',
  order: 3,
  chapter: 'counter',
  targetPattern: 'builder',
  circuit: {
    nodes: [
      { id: 'customer', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'order',
        className: 'Order',
        at: [6, 2],
        behavior: { type: 'transform', when: { hasTag: 'crossed-args' }, addTags: ['milk-in-syrup'] },
        codeRef: 'Order#initialize',
      },
      { id: 'charge', className: 'Cashier', at: [10, 2], behavior: { type: 'pass' }, codeRef: 'Cashier#charge' },
      {
        id: 'prepare',
        className: 'Barista',
        at: [13, 2],
        behavior: { type: 'guard', require: { not: impossible }, onFail: 'drop' },
        codeRef: 'Barista#prepare',
      },
      {
        id: 'handOver',
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
      inventory: ['builder', 'factory-method', 'decorator'],
      options: {
        builder: {
          outcome: 'solves',
          code: 'builder',
          patch: {
            remove: ['order'],
            add: {
              nodes: [
                station('bSize', 'OrderBuilder#size', 4),
                station('bMilk', 'OrderBuilder#milk', 6, fixCrossedArgs),
                station('bExtras', 'OrderBuilder#extras', 8),
                station('build', 'OrderBuilder#build', 10, { type: 'guard', require: { not: impossible }, onFail: 'reject' }),
                { id: 'notify', className: 'Counter', kind: 'class', at: [13, 0], behavior: { type: 'sink', message: '' }, codeRef: 'Counter#notify' },
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
          patch: {
            remove: ['order'],
            add: {
              nodes: [
                { id: 'presets', className: 'OrderPresets', kind: 'class', at: [6, 2], behavior: { type: 'slot' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'lattePreset', className: 'OrderPresets', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
                { id: 'americanoPreset', className: 'OrderPresets', kind: 'class', at: [8, 4], behavior: { type: 'pass' }, codeRef: 'OrderPresets#create', skin: 'factory-method' },
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
          patch: {
            remove: ['order'],
            add: {
              nodes: [
                { id: 'withMilk', className: 'WithMilk', kind: 'class', at: [6, 2], behavior: fixCrossedArgs, codeRef: 'WithMilk', skin: 'decorator' },
                { id: 'withSyrup', className: 'WithSyrup', kind: 'class', at: [8, 0], behavior: { type: 'pass' }, codeRef: 'WithSyrup', skin: 'decorator' },
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
        { at: 0, from: 'customer', tags: ['combo:large-latte'], label: '' },
        { at: 45, from: 'customer', tags: ['combo:oat-vanilla-latte', 'crossed-args'], label: '' },
        { at: 90, from: 'customer', tags: ['combo:iced-americano', 'hot', 'ice'], label: '' },
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
    py: {
      base: codePy(pyBase),
      builder: codePy(pyBuilder),
      factory: codePy(pyFactory),
      decorator: codePy(pyDecorator),
    },
  },
})
