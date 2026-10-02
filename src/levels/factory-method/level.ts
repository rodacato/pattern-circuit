import { defineLevel, type NodeDef, type Predicate, type WireDef } from '../../engine'
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

// Cada sucursal tiene su bebida; entregar otra es un pedido equivocado.
const MENU: Record<string, string> = { downtown: 'latte', beach: 'frappe', mountain: 'chocolate', harbor: 'tea' }
const rightDrink: Predicate = { any: Object.entries(MENU).map(([branch, drink]) => ({ all: [{ hasTag: branch }, { hasTag: `made:${drink}` }] })) }

const product = (id: string, label: string, className: string, drink: string, at: [number, number]): NodeDef => ({
  id,
  label,
  className,
  kind: 'class',
  at,
  behavior: { type: 'transform', addTags: [`made:${drink}`], setShape: 'diamond' },
  codeRef: className,
})

const BRANCHES = [
  { key: 'downtown', id: 'downtownBranch', label: 'Centro', className: 'DowntownBranch', drink: 'latte', row: 0 },
  { key: 'beach', id: 'beachBranch', label: 'Playa', className: 'BeachBranch', drink: 'frappe', row: 2 },
  { key: 'mountain', id: 'mountainBranch', label: 'Montaña', className: 'MountainBranch', drink: 'chocolate', row: 4 },
] as const

const creator = (b: { id: string; label: string; className: string; drink: string; row: number }): NodeDef => ({
  id: b.id,
  label: b.label,
  className: b.className,
  kind: 'class',
  at: [9, b.row],
  behavior: { type: 'transform', addTags: [`made:${b.drink}`], setShape: 'diamond' },
  codeRef: `${b.className}#create_drink`,
  skin: 'factory-method',
})

const toBarista = (id: string): WireDef => ({ from: id, to: 'prepare', port: 'out', dep: 'concrete' })

const order = (at: number, branch: string, label: string) => ({ at, from: 'customer', tags: [branch], data: { branch }, label })

export default defineLevel({
  id: 'factory-method',
  order: 2,
  chapter: 'counter',
  title: 'Dos sucursales, dos menús',
  targetPattern: 'factory-method',
  brief: {
    problem: 'El flujo de pedidos que comparten todas las sucursales decide con if qué bebida crear. Abrimos Montaña y le llegan lattes en vez de chocolate.',
    goal: 'Que cada sucursal reciba su bebida y que abrir otra no obligue a tocar el flujo compartido.',
  },
  circuit: {
    nodes: [
      { id: 'customer', label: 'Cliente', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', label: 'Tomar pedido', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'create',
        label: 'Crear bebida',
        className: 'OrderFlow',
        at: [6, 2],
        behavior: { type: 'branch', cases: { downtown: 'latte', beach: 'frappe' }, else: 'latte' },
        codeRef: 'OrderFlow#create_drink',
      },
      product('frappe', 'Frappé', 'Frappe', 'frappe', [9, 1]),
      product('latte', 'Latte', 'Latte', 'latte', [9, 3]),
      { id: 'prepare', label: 'Preparar', className: 'Barista', at: [12, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'handOver', label: 'Entregar', className: 'Counter', at: [15, 2], behavior: { type: 'sink', expects: rightDrink }, codeRef: 'Counter#hand_over' },
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
      label: 'Crear bebida',
      inventory: ['factory-method', 'singleton', 'builder'],
      options: {
        'factory-method': {
          outcome: 'solves',
          code: 'factory',
          note: {
            title: 'Factory Method: cada subclase decide qué crear',
            body: 'El flujo de tomar pedidos es uno solo y llama a create_drink. Cada sucursal es una subclase con su propio molde: el flujo compartido ya no conoce ninguna bebida concreta.',
          },
          patch: {
            remove: ['frappe', 'latte'],
            update: [{ id: 'create', label: 'Sucursal', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map(creator),
              wires: BRANCHES.flatMap((b) => [{ from: 'create', to: b.id, key: b.key, port: 'out', dep: 'abstract' as const }, toBarista(b.id)]),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          note: {
            title: 'Singleton: una sola instancia para todos',
            body: 'Singleton solo garantiza que exista una única fábrica; no aporta nada a este problema. Lo que tenía que variar por sucursal era qué se crea, y la fábrica única sigue decidiendo igual para todas.',
          },
          patch: {
            remove: ['frappe', 'latte'],
            update: [
              {
                id: 'create',
                label: 'Fábrica única',
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
          note: {
            title: 'Builder arma, no elige la clase',
            body: 'Builder sirve para armar un objeto con muchas partes. Aquí el problema no era cuántas piezas tiene la bebida sino qué bebida crear: el if del flujo compartido sigue decidiendo mal.',
          },
          patch: {
            removeWires: ['take->create'],
            add: {
              nodes: [
                { id: 'bSize', label: 'Tamaño', className: 'DrinkBuilder', kind: 'class', at: [4, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#size', skin: 'builder' },
                { id: 'bTemp', label: 'Temperatura', className: 'DrinkBuilder', kind: 'class', at: [6, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#temperature', skin: 'builder' },
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
    { id: 'main', pulses: [order(0, 'downtown', 'Centro'), order(45, 'beach', 'Playa'), order(90, 'mountain', 'Montaña')] },
    {
      id: 'with-harbor',
      pulses: [order(0, 'downtown', 'Centro'), order(45, 'beach', 'Playa'), order(90, 'mountain', 'Montaña'), order(135, 'harbor', 'Puerto')],
    },
  ],
  changeTickets: [
    {
      id: 'harbor-branch',
      text: 'Abre la sucursal Puerto: solo vende té helado.',
      scenario: 'with-harbor',
      without: {
        update: [{ id: 'create', behavior: { type: 'branch', cases: { downtown: 'latte', beach: 'frappe', harbor: 'tea' }, else: 'latte' } }],
        add: {
          nodes: [product('tea', 'Té helado', 'IcedTea', 'tea', [9, 5])],
          wires: [
            { from: 'create', port: 'tea', to: 'tea', dep: 'concrete' },
            { from: 'tea', port: 'out', to: 'prepare', dep: 'concrete' },
          ],
        },
      },
      with: {
        add: {
          nodes: [creator({ id: 'harborBranch', label: 'Puerto', className: 'HarborBranch', drink: 'tea', row: 6 })],
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
