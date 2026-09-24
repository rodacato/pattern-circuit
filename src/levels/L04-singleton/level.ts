import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import factory from './factory.rb?raw'
import singleton from './singleton.rb?raw'
import strategy from './strategy.rb?raw'

const code = withCommon(common)
const counter = (id: string, at: [number, number], key: string, fresh = false, codeRef = 'TicketCounter#next') =>
  node(id, 'Contador', 'TicketCounter', at, { type: 'counter', key, field: 'ticket', fresh }, { codeRef })

const orders = ['a', 'b', 'a', 'b', 'a', 'b'].map((caja, i) => pulse(i * 22, `Caja ${caja.toUpperCase()}`, [`caja:${caja}`]))

export default defineLevel({
  id: 'L04-singleton',
  order: 4,
  chapter: 'mostrador',
  title: 'Turnos repetidos',
  targetPattern: 'singleton',
  brief: {
    problem: 'Abrimos una segunda caja. Cada caja crea su propio contador de turnos y la pantalla anuncia el turno 1 dos veces, el 2 dos veces…',
    goal: 'Que todos los turnos sean únicos sin importar qué caja cobre.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('fila', 'Fila', 'Lobby', [3, 2], { type: 'branch', cases: { 'caja:a': 'a', 'caja:b': 'b' } }, { codeRef: 'Lobby#route' }),
      node('cajaA', 'Caja A', 'Register', [6, 0], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      node('cajaB', 'Caja B', 'Register', [6, 4], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      counter('contA', [9, 0], 'A'),
      counter('contB', [9, 4], 'B'),
      node('pantalla', 'Pantalla', 'Display', [12, 2], { type: 'sink', uniqueBy: 'ticket' }, { codeRef: 'Display#show' }),
    ],
    wires: [
      wire('cliente', 'fila'),
      wire('fila', 'cajaA', { port: 'a' }),
      wire('fila', 'cajaB', { port: 'b' }),
      ...chain('cajaA', 'contA', 'pantalla'),
      ...chain('cajaB', 'contB', 'pantalla'),
    ],
  },
  sockets: [
    {
      id: 'contador',
      at: 'fila',
      label: 'Contador de turnos',
      inventory: ['singleton', 'factory-method', 'strategy'],
      options: {
        singleton: {
          outcome: 'solves',
          code: 'singleton',
          note: {
            title: 'Singleton: una sola instancia compartida',
            body: 'Todas las cajas usan el mismo contador y los turnos ya no se repiten. Ojo con el precio: ahora cualquier clase puede alcanzar ese contador global. Ese acoplamiento vuelve en el nivel de Ports & Adapters.',
          },
          patch: {
            remove: ['contA', 'contB'],
            add: {
              nodes: [skinned('singleton', counter('contador', [9, 2], 'global'))],
              wires: [wire('cajaA', 'contador'), wire('cajaB', 'contador'), wire('contador', 'pantalla')],
            },
          },
        },
        'factory-method': {
          outcome: 'misfit',
          code: 'factory',
          note: {
            title: 'Factory Method crea objetos nuevos',
            body: 'Una fábrica entrega un contador recién hecho en cada pedido: todos los turnos salen con el número 1. Aquí no hacía falta crear más, sino compartir uno.',
          },
          patch: {
            remove: ['contA', 'contB'],
            add: {
              nodes: [
                skinned('factory-method', counter('fabA', [9, 0], 'A', true, 'CounterFactory#create')),
                skinned('factory-method', counter('fabB', [9, 4], 'B', true, 'CounterFactory#create')),
              ],
              wires: [...chain('cajaA', 'fabA', 'pantalla'), ...chain('cajaB', 'fabB', 'pantalla')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy intercambia comportamiento, no comparte estado',
            body: 'Cada caja recibe su estrategia de numeración, pero cada una crea su propia cuenta. El problema era de identidad (una sola cuenta), no de algoritmo. Inyectar el mismo contador a ambas cajas también funcionaría, sin nada global: lo verás en Ports & Adapters.',
          },
          patch: {
            update: [
              { id: 'contA', skin: 'strategy' },
              { id: 'contB', skin: 'strategy' },
            ],
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: orders }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 6 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
  ],
  code: { rb: { base: code(base), singleton: code(singleton), factory: code(factory), strategy: code(strategy) } },
})
