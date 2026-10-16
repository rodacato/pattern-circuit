import { defineLevel } from '../../engine'
import { actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import proxy from './proxy.rb?raw'
import singleton from './singleton.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyFacade from './py/facade.py?raw'
import pyProxy from './py/proxy.py?raw'
import pySingleton from './py/singleton.py?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsProxy from './ts/proxy.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const items = ['coffee', 'milk', 'coffee', 'coffee', 'milk', 'coffee']

export default defineLevel({
  id: 'proxy',
  order: 9,
  chapter: 'bar',
  targetPattern: 'proxy',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('take', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('warehouse', 'RemoteInventory', [8, 0], { type: 'pass' }, { kind: 'external', cost: 90, capacity: 1, codeRef: 'RemoteInventory#in_stock?' }),
      node('prepare', 'Barista', [11, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [14, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [wire('customer', 'take'), wire('take', 'warehouse'), wire('warehouse', 'prepare'), wire('prepare', 'handOver')],
  },
  sockets: [
    {
      id: 'inventory',
      at: 'take',
      inventory: ['proxy', 'singleton', 'facade'],
      options: {
        proxy: {
          outcome: 'solves',
          code: 'proxy',
          patch: {
            removeWires: ['take->warehouse'],
            add: {
              nodes: [skinned('proxy', node('proxy', 'CachedInventory', [5.5, 2], { type: 'cache', key: 'item' }, { codeRef: 'CachedInventory#in_stock?' }))],
              wires: [wire('take', 'proxy'), wire('proxy', 'warehouse', { port: 'miss' }), wire('proxy', 'prepare', { port: 'hit' })],
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          patch: { update: [{ id: 'warehouse', skin: 'singleton', codeRef: 'RemoteInventory.instance' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          patch: {
            removeWires: ['take->warehouse'],
            add: {
              nodes: [skinned('facade', node('desk', 'StockDesk', [5.5, 2], { type: 'pass' }, { codeRef: 'StockDesk#in_stock?' }))],
              wires: [wire('take', 'desk'), wire('desk', 'warehouse')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: items.map((item, i) => pulse(i * 20, [item], { item })) }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 6 },
    { metric: 'maxLoad', op: '<=', value: 2 },
  ],
  code: {
    rb: { base: code(base), proxy: code(proxy), singleton: code(singleton), facade: code(facade) },
    ts: { base: codeTs(tsBase), proxy: codeTs(tsProxy), singleton: codeTs(tsSingleton), facade: codeTs(tsFacade) },
    // In Python a second `class RemoteInventory` would replace the first: the singleton snippet adds to the class, so the common code goes first.
    py: { base: codePy(pyBase), proxy: codePy(pyProxy), singleton: `${pyCommon}\n${pySingleton}`, facade: codePy(pyFacade) },
  },
})
