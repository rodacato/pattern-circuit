import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import factory from './factory.rb?raw'
import singleton from './singleton.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFactory from './ts/factory.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const counter = (id: string, at: [number, number], key: string, fresh = false, codeRef = 'TicketCounter#next') =>
  node(id, 'Contador', 'TicketCounter', at, { type: 'counter', key, field: 'ticket', fresh }, { codeRef })

const orders = ['a', 'b', 'a', 'b', 'a', 'b'].map((register, i) => pulse(i * 22, `Caja ${register.toUpperCase()}`, [`register:${register}`]))

export default defineLevel({
  id: 'singleton',
  order: 4,
  chapter: 'counter',
  title: 'Turnos repetidos',
  targetPattern: 'singleton',
  brief: {
    problem: 'Abrimos una segunda caja. Cada caja crea su propio contador de turnos y la pantalla anuncia el turno 1 dos veces, el 2 dos veces…',
    goal: 'Que todos los turnos sean únicos sin importar qué caja cobre.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('lobby', 'Fila', 'Lobby', [3, 2], { type: 'branch', cases: { 'register:a': 'a', 'register:b': 'b' } }, { codeRef: 'Lobby#route' }),
      node('registerA', 'Caja A', 'Register', [6, 0], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      node('registerB', 'Caja B', 'Register', [6, 4], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      counter('counterA', [9, 0], 'A'),
      counter('counterB', [9, 4], 'B'),
      node('display', 'Pantalla', 'Display', [12, 2], { type: 'sink', uniqueBy: 'ticket' }, { codeRef: 'Display#show' }),
    ],
    wires: [
      wire('customer', 'lobby'),
      wire('lobby', 'registerA', { port: 'a' }),
      wire('lobby', 'registerB', { port: 'b' }),
      ...chain('registerA', 'counterA', 'display'),
      ...chain('registerB', 'counterB', 'display'),
    ],
  },
  sockets: [
    {
      id: 'ticketCounter',
      at: 'lobby',
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
            remove: ['counterA', 'counterB'],
            add: {
              nodes: [skinned('singleton', counter('ticketCounter', [9, 2], 'global'))],
              wires: [wire('registerA', 'ticketCounter'), wire('registerB', 'ticketCounter'), wire('ticketCounter', 'display')],
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
            remove: ['counterA', 'counterB'],
            add: {
              nodes: [
                skinned('factory-method', counter('factoryA', [9, 0], 'A', true, 'CounterFactory#create')),
                skinned('factory-method', counter('factoryB', [9, 4], 'B', true, 'CounterFactory#create')),
              ],
              wires: [...chain('registerA', 'factoryA', 'display'), ...chain('registerB', 'factoryB', 'display')],
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
              { id: 'counterA', skin: 'strategy' },
              { id: 'counterB', skin: 'strategy' },
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
  code: {
    rb: { base: code(base), singleton: code(singleton), factory: code(factory), strategy: code(strategy) },
    ts: { base: codeTs(tsBase), singleton: codeTs(tsSingleton), factory: codeTs(tsFactory), strategy: codeTs(tsStrategy) },
  },
})
