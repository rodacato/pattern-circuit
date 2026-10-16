import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import factory from './factory.rb?raw'
import singleton from './singleton.rb?raw'
import strategy from './strategy.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyFactory from './py/factory.py?raw'
import pySingleton from './py/singleton.py?raw'
import pyStrategy from './py/strategy.py?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFactory from './ts/factory.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const counter = (id: string, at: [number, number], key: string, fresh = false, codeRef = 'TicketCounter#next') =>
  node(id, 'TicketCounter', at, { type: 'counter', key, field: 'ticket', fresh }, { codeRef })

const orders = ['a', 'b', 'a', 'b', 'a', 'b'].map((register, i) => pulse(i * 22, [`register:${register}`]))

export default defineLevel({
  id: 'singleton',
  order: 4,
  chapter: 'counter',
  targetPattern: 'singleton',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('lobby', 'Lobby', [3, 2], { type: 'branch', cases: { 'register:a': 'a', 'register:b': 'b' } }, { codeRef: 'Lobby#route' }),
      node('registerA', 'Register', [6, 0], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      node('registerB', 'Register', [6, 4], { type: 'pass' }, { codeRef: 'Register#checkout' }),
      counter('counterA', [9, 0], 'A'),
      counter('counterB', [9, 4], 'B'),
      node('display', 'Display', [12, 2], { type: 'sink', uniqueBy: 'ticket' }, { codeRef: 'Display#show' }),
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
      inventory: ['singleton', 'factory-method', 'strategy'],
      options: {
        singleton: {
          outcome: 'solves',
          code: 'singleton',
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
    py: { base: codePy(pyBase), singleton: codePy(pySingleton), factory: codePy(pyFactory), strategy: codePy(pyStrategy) },
  },
})
