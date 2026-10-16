import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseKitchen from './base_kitchen.rb?raw'
import chainCode from './chain.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import observerKitchen from './observer_kitchen.rb?raw'
import strategy from './strategy.rb?raw'
import pyBase from './py/base.py?raw'
import pyBaseKitchen from './py/base_kitchen.py?raw'
import pyChain from './py/chain.py?raw'
import pyCommon from './py/common.py?raw'
import pyObserver from './py/observer.py?raw'
import pyObserverKitchen from './py/observer_kitchen.py?raw'
import pyStrategy from './py/strategy.py?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseKitchen from './ts/base_kitchen.ts?raw'
import tsChain from './ts/chain.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsObserverKitchen from './ts/observer_kitchen.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const subscriber = (id: string, className: string, y: number) =>
  node(id, className, [10, y], { type: 'sink', message: '' }, { codeRef: `${className}#update` })

export default defineLevel({
  id: 'observer',
  order: 10,
  chapter: 'rush-hour',
  targetPattern: 'observer',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('bar', 'Barista', [3, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('ready', 'Order', [6, 2], { type: 'broadcast' }, { codeRef: 'Order#complete!' }),
      subscriber('display', 'Display', 0),
      subscriber('push', 'PushNotifier', 2),
      subscriber('loyalty', 'LoyaltyProgram', 4),
    ],
    wires: [...chain('customer', 'bar', 'ready'), wire('ready', 'display'), wire('ready', 'push')],
  },
  sockets: [
    {
      id: 'notices',
      at: 'ready',
      inventory: ['observer', 'strategy', 'chain-of-responsibility'],
      options: {
        observer: {
          outcome: 'solves',
          code: 'observer',
          patch: {
            removeWires: ['ready->display', 'ready->push'],
            update: [{ id: 'ready', skin: 'observer' }, ...['display', 'push', 'loyalty'].map((id) => ({ id, skin: 'observer' as const }))],
            add: { wires: [abstract('ready', 'display'), abstract('ready', 'push'), abstract('ready', 'loyalty')] },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          patch: {
            removeWires: ['ready->display', 'ready->push'],
            update: [{ id: 'ready', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: { wires: [abstract('ready', 'display', 'display'), abstract('ready', 'push', 'push'), abstract('ready', 'loyalty', 'loyalty')] },
          },
        },
        'chain-of-responsibility': {
          outcome: 'misfit',
          code: 'chain',
          patch: {
            removeWires: ['ready->push'],
            update: [{ id: 'ready', behavior: { type: 'pass' }, skin: 'chain-of-responsibility' }],
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, ['display']), pulse(40, ['display']), pulse(80, ['display'])] }],
  changeTickets: [
    {
      id: 'kitchen',
      scenario: 'main',
      without: { add: { nodes: [subscriber('kitchen', 'Kitchen', 6)], wires: [wire('ready', 'kitchen')] } },
      with: { add: { nodes: [skinned('observer', subscriber('kitchen', 'Kitchen', 6))], wires: [abstract('ready', 'kitchen')] } },
      code: { without: 'base_kitchen', with: 'observer_kitchen' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 9 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      base_kitchen: code(baseKitchen),
      observer: code(observer),
      observer_kitchen: code(observerKitchen),
      strategy: code(strategy),
      chain: code(chainCode),
    },
    ts: {
      base: codeTs(tsBase),
      base_kitchen: codeTs(tsBaseKitchen),
      observer: codeTs(tsObserver),
      observer_kitchen: codeTs(tsObserverKitchen),
      strategy: codeTs(tsStrategy),
      chain: codeTs(tsChain),
    },
    py: {
      base: codePy(pyBase),
      base_kitchen: codePy(pyBaseKitchen),
      observer: codePy(pyObserver),
      observer_kitchen: codePy(pyObserverKitchen),
      strategy: codePy(pyStrategy),
      chain: codePy(pyChain),
    },
  },
})
