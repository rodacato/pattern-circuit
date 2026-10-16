import { defineLevel, type NodeInput, type Predicate, type WireInput } from '../../engine'
import base from './base.rb?raw'
import baseHarbor from './base_harbor.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import { withCommon } from '../kit'
import factory from './factory.rb?raw'
import factoryHarbor from './factory_harbor.rb?raw'
import singleton from './singleton.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseHarbor from './ts/base_harbor.ts?raw'
import tsBuilder from './ts/builder.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFactory from './ts/factory.ts?raw'
import tsFactoryHarbor from './ts/factory_harbor.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)

// Each branch has its own drink; delivering another one is a wrong order.
const MENU: Record<string, string> = { downtown: 'latte', beach: 'frappe', mountain: 'chocolate', harbor: 'tea' }
const rightDrink: Predicate = { any: Object.entries(MENU).map(([branch, drink]) => ({ all: [{ hasTag: branch }, { hasTag: `made:${drink}` }] })) }

const product = (id: string, className: string, drink: string, at: [number, number]): NodeInput => ({
  id,
  className,
  kind: 'class',
  at,
  behavior: { type: 'transform', addTags: [`made:${drink}`], setShape: 'diamond' },
  codeRef: className,
})

const BRANCHES = [
  { key: 'downtown', id: 'downtownBranch', className: 'DowntownBranch', drink: 'latte', row: 0 },
  { key: 'beach', id: 'beachBranch', className: 'BeachBranch', drink: 'frappe', row: 2 },
  { key: 'mountain', id: 'mountainBranch', className: 'MountainBranch', drink: 'chocolate', row: 4 },
] as const

const creator = (b: { id: string; className: string; drink: string; row: number }): NodeInput => ({
  id: b.id,
  className: b.className,
  kind: 'class',
  at: [9, b.row],
  behavior: { type: 'transform', addTags: [`made:${b.drink}`], setShape: 'diamond' },
  codeRef: `${b.className}#create_drink`,
  skin: 'factory-method',
})

const toBarista = (id: string): WireInput => ({ from: id, to: 'prepare', port: 'out', dep: 'concrete' })

const order = (at: number, branch: string) => ({ at, from: 'customer', tags: [branch], data: { branch }, label: '' })

export default defineLevel({
  id: 'factory-method',
  order: 2,
  chapter: 'counter',
  targetPattern: 'factory-method',
  circuit: {
    nodes: [
      { id: 'customer', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'create',
        className: 'OrderFlow',
        at: [6, 2],
        behavior: { type: 'branch', cases: { downtown: 'latte', beach: 'frappe' }, else: 'latte' },
        codeRef: 'OrderFlow#create_drink',
      },
      product('frappe', 'Frappe', 'frappe', [9, 1]),
      product('latte', 'Latte', 'latte', [9, 3]),
      { id: 'prepare', className: 'Barista', at: [12, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'handOver', className: 'Counter', at: [15, 2], behavior: { type: 'sink', expects: rightDrink }, codeRef: 'Counter#hand_over' },
    ],
    wires: [
      { from: 'customer', to: 'take' },
      { from: 'take', to: 'create' },
      { from: 'create', port: 'frappe', to: 'frappe' },
      { from: 'create', port: 'latte', to: 'latte' },
      { from: 'frappe', to: 'prepare' },
      { from: 'latte', to: 'prepare' },
      { from: 'prepare', to: 'handOver' },
    ],
  },
  sockets: [
    {
      id: 'create-drink',
      at: 'create',
      inventory: ['factory-method', 'singleton', 'builder'],
      options: {
        'factory-method': {
          outcome: 'solves',
          code: 'factory',
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'option.create-drink.factory-method.label.create', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map(creator),
              wires: BRANCHES.flatMap((b) => [{ from: 'create', to: b.id, key: b.key, port: 'out', dep: 'abstract' as const }, toBarista(b.id)]),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          patch: {
            remove: ['frappe', 'latte'],
            update: [
              {
                id: 'create',
                label: 'option.create-drink.singleton.label.create',
                className: 'DrinkFactory',
                behavior: { type: 'transform', addTags: ['made:latte'], setShape: 'diamond' },
                codeRef: 'DrinkFactory#create',
                skin: 'singleton',
              },
            ],
            add: { wires: [toBarista('create')] },
          },
        },
        builder: {
          outcome: 'misfit',
          code: 'builder',
          patch: {
            removeWires: ['take->create'],
            add: {
              nodes: [
                { id: 'bSize', className: 'DrinkBuilder', kind: 'class', at: [4, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#size', skin: 'builder' },
                { id: 'bTemp', className: 'DrinkBuilder', kind: 'class', at: [6, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#temperature', skin: 'builder' },
              ],
              wires: [
                { from: 'take', to: 'bSize', port: 'out', dep: 'concrete' },
                { from: 'bSize', to: 'bTemp', port: 'out', dep: 'concrete' },
                { from: 'bTemp', to: 'create', port: 'out', dep: 'concrete' },
              ],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: [order(0, 'downtown'), order(45, 'beach'), order(90, 'mountain')] },
    {
      id: 'with-harbor',
      pulses: [order(0, 'downtown'), order(45, 'beach'), order(90, 'mountain'), order(135, 'harbor')],
    },
  ],
  changeTickets: [
    {
      id: 'harbor-branch',
      scenario: 'with-harbor',
      without: {
        update: [{ id: 'create', behavior: { type: 'branch', cases: { downtown: 'latte', beach: 'frappe', harbor: 'tea' }, else: 'latte' } }],
        add: {
          nodes: [product('tea', 'IcedTea', 'tea', [9, 5])],
          wires: [
            { from: 'create', port: 'tea', to: 'tea', dep: 'concrete' },
            { from: 'tea', port: 'out', to: 'prepare', dep: 'concrete' },
          ],
        },
      },
      with: {
        add: {
          nodes: [creator({ id: 'harborBranch', className: 'HarborBranch', drink: 'tea', row: 6 })],
          wires: [{ from: 'create', to: 'harborBranch', key: 'harbor', port: 'out', dep: 'abstract' }, toBarista('harborBranch')],
        },
      },
      code: { without: 'base_harbor', with: 'factory_harbor' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      base_harbor: code(baseHarbor),
      factory: code(factory),
      factory_harbor: code(factoryHarbor),
      singleton: code(singleton),
      builder: code(builder),
    },
    ts: {
      base: codeTs(tsBase),
      base_harbor: codeTs(tsBaseHarbor),
      factory: codeTs(tsFactory),
      factory_harbor: codeTs(tsFactoryHarbor),
      singleton: codeTs(tsSingleton),
      builder: codeTs(tsBuilder),
    },
  },
})
