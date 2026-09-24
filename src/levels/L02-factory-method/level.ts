import { defineLevel, type NodeDef, type Predicate, type WireDef } from '../../engine'
import base from './base.rb?raw'
import basePuerto from './base_puerto.rb?raw'
import builder from './builder.rb?raw'
import common from './common.rb?raw'
import { withCommon } from '../kit'
import factory from './factory.rb?raw'
import factoryPuerto from './factory_puerto.rb?raw'
import singleton from './singleton.rb?raw'

const code = withCommon(common)

// Cada sucursal tiene su bebida; entregar otra es un pedido equivocado.
const MENU: Record<string, string> = { centro: 'latte', playa: 'frappe', montana: 'chocolate', puerto: 'te' }
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
  { key: 'centro', id: 'sucCentro', label: 'Centro', className: 'CentroBranch', drink: 'latte', row: 0 },
  { key: 'playa', id: 'sucPlaya', label: 'Playa', className: 'PlayaBranch', drink: 'frappe', row: 2 },
  { key: 'montana', id: 'sucMontana', label: 'Montaña', className: 'MontanaBranch', drink: 'chocolate', row: 4 },
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

const toBarista = (id: string): WireDef => ({ from: id, to: 'preparar', port: 'out', dep: 'concrete' })

const order = (at: number, branch: string, label: string) => ({ at, from: 'cliente', tags: [branch], data: { branch }, label })

export default defineLevel({
  id: 'L02-factory-method',
  order: 2,
  chapter: 'mostrador',
  title: 'Dos sucursales, dos menús',
  targetPattern: 'factory-method',
  brief: {
    problem: 'El flujo de pedidos que comparten todas las sucursales decide con if qué bebida crear. Abrimos Montaña y le llegan lattes en vez de chocolate.',
    goal: 'Que cada sucursal reciba su bebida y que abrir otra no obligue a tocar el flujo compartido.',
  },
  circuit: {
    nodes: [
      { id: 'cliente', label: 'Cliente', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'tomar', label: 'Tomar pedido', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      {
        id: 'crear',
        label: 'Crear bebida',
        className: 'OrderFlow',
        at: [6, 2],
        behavior: { type: 'branch', cases: { centro: 'latte', playa: 'frappe' }, else: 'latte' },
        codeRef: 'OrderFlow#create_drink',
      },
      product('frappe', 'Frappé', 'Frappe', 'frappe', [9, 1]),
      product('latte', 'Latte', 'Latte', 'latte', [9, 3]),
      { id: 'preparar', label: 'Preparar', className: 'Barista', at: [12, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'entregar', label: 'Entregar', className: 'Counter', at: [15, 2], behavior: { type: 'sink', expects: rightDrink }, codeRef: 'Counter#hand_over' },
    ],
    wires: [
      { from: 'cliente', to: 'tomar' },
      { from: 'tomar', to: 'crear' },
      { from: 'crear', port: 'frappe', to: 'frappe' },
      { from: 'crear', port: 'latte', to: 'latte' },
      { from: 'frappe', to: 'preparar' },
      { from: 'latte', to: 'preparar' },
      { from: 'preparar', to: 'entregar' },
    ],
  },
  sockets: [
    {
      id: 'crear-bebida',
      at: 'crear',
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
            update: [{ id: 'crear', label: 'Sucursal', className: 'Branch', behavior: { type: 'slot' }, codeRef: 'Branch#take', skin: 'factory-method' }],
            add: {
              nodes: BRANCHES.map(creator),
              wires: BRANCHES.flatMap((b) => [{ from: 'crear', to: b.id, key: b.key, port: 'out', dep: 'abstract' as const }, toBarista(b.id)]),
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
                id: 'crear',
                label: 'Fábrica única',
                className: 'DrinkFactory',
                behavior: { type: 'transform', addTags: ['made:latte'], setShape: 'diamond' },
                codeRef: 'DrinkFactory#create',
                skin: 'singleton',
              },
            ],
            add: { wires: [toBarista('crear')] },
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
            removeWires: ['tomar->crear'],
            add: {
              nodes: [
                { id: 'bTamano', label: 'Tamaño', className: 'DrinkBuilder', kind: 'class', at: [4, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#size', skin: 'builder' },
                { id: 'bTemp', label: 'Temperatura', className: 'DrinkBuilder', kind: 'class', at: [6, 0], behavior: { type: 'pass' }, codeRef: 'DrinkBuilder#temperature', skin: 'builder' },
              ],
              wires: [
                { from: 'tomar', to: 'bTamano', port: 'out', dep: 'concrete' },
                { from: 'bTamano', to: 'bTemp', port: 'out', dep: 'concrete' },
                { from: 'bTemp', to: 'crear', port: 'out', dep: 'concrete' },
              ],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: [order(0, 'centro', 'Centro'), order(45, 'playa', 'Playa'), order(90, 'montana', 'Montaña')] },
    {
      id: 'con-puerto',
      pulses: [order(0, 'centro', 'Centro'), order(45, 'playa', 'Playa'), order(90, 'montana', 'Montaña'), order(135, 'puerto', 'Puerto')],
    },
  ],
  changeTickets: [
    {
      id: 'sucursal-puerto',
      text: 'Abre la sucursal Puerto: solo vende té helado.',
      scenario: 'con-puerto',
      without: {
        update: [{ id: 'crear', behavior: { type: 'branch', cases: { centro: 'latte', playa: 'frappe', puerto: 'te' }, else: 'latte' } }],
        add: {
          nodes: [product('te', 'Té helado', 'IcedTea', 'te', [9, 5])],
          wires: [
            { from: 'crear', port: 'te', to: 'te', dep: 'concrete' },
            { from: 'te', port: 'out', to: 'preparar', dep: 'concrete' },
          ],
        },
      },
      with: {
        add: {
          nodes: [creator({ id: 'sucPuerto', label: 'Puerto', className: 'PuertoBranch', drink: 'te', row: 6 })],
          wires: [{ from: 'crear', to: 'sucPuerto', key: 'puerto', port: 'out', dep: 'abstract' }, toBarista('sucPuerto')],
        },
      },
      code: { without: 'base_puerto', with: 'factory_puerto' },
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
      base_puerto: code(basePuerto),
      factory: code(factory),
      factory_puerto: code(factoryPuerto),
      singleton: code(singleton),
      builder: code(builder),
    },
  },
})
