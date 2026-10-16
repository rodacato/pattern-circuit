import { defineLevel, type NodeInput } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import basePreheat from './base_preheat.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import facadePreheat from './facade_preheat.rb?raw'
import proxy from './proxy.rb?raw'
import pyAdapter from './py/adapter.py?raw'
import pyBase from './py/base.py?raw'
import pyBasePreheat from './py/base_preheat.py?raw'
import pyCommon from './py/common.py?raw'
import pyFacade from './py/facade.py?raw'
import pyFacadePreheat from './py/facade_preheat.py?raw'
import pyProxy from './py/proxy.py?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsBasePreheat from './ts/base_preheat.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsFacadePreheat from './ts/facade_preheat.ts?raw'
import tsProxy from './ts/proxy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const step = (id: string, className: string, codeRef: string, at: [number, number], tag: string): NodeInput =>
  node(id, className, at, { type: 'transform', addTags: [tag] }, { codeRef })
const preheat = (id: string, at: [number, number]) => step(id, 'EspressoMachine', 'EspressoMachine#preheat', at, 'preheated')

export default defineLevel({
  id: 'facade',
  order: 8,
  chapter: 'bar',
  targetPattern: 'facade',
  circuit: {
    nodes: [
      actor('counter', [0, 1]),
      actor('app', [0, 4]),
      step('grinder', 'Grinder', 'Grinder#grind', [6, 1], 'ground'),
      step('espresso', 'EspressoMachine', 'EspressoMachine#extract', [9, 1], 'extracted'),
      step('frother', 'MilkFrother', 'MilkFrother#froth', [12, 1], 'frothed'),
      step('grinderApp', 'Grinder', 'DeliveryApp#make_latte', [6, 4], 'ground'),
      step('espressoApp', 'EspressoMachine', 'DeliveryApp#make_latte', [9, 4], 'extracted'),
      node('handOver', 'Counter', [15, 2.5], { type: 'sink', expects: { all: [{ hasTag: 'ground' }, { hasTag: 'extracted' }, { hasTag: 'frothed' }] } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [...chain('counter', 'grinder', 'espresso', 'frother', 'handOver'), ...chain('app', 'grinderApp', 'espressoApp', 'handOver')],
  },
  sockets: [
    {
      id: 'kitchen',
      at: 'grinder',
      inventory: ['facade', 'adapter', 'proxy'],
      options: {
        facade: {
          outcome: 'solves',
          code: 'facade',
          patch: {
            remove: ['grinderApp', 'espressoApp'],
            removeWires: ['counter->grinder'],
            update: ['grinder', 'espresso', 'frother'].map((id) => ({ id, skin: 'facade' as const })),
            add: {
              nodes: [skinned('facade', node('kitchen', 'KitchenFacade', [3, 2.5], { type: 'pass' }, { codeRef: 'KitchenFacade#latte' }))],
              wires: [wire('counter', 'kitchen'), wire('app', 'kitchen'), wire('kitchen', 'grinder')],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'adapter',
          patch: {
            removeWires: ['app->grinderApp'],
            add: {
              nodes: [skinned('adapter', node('adapter', 'DeliveryRequestAdapter', [3, 4], { type: 'transform', setShape: 'square' }))],
              wires: [wire('app', 'adapter'), wire('adapter', 'grinderApp')],
            },
          },
        },
        proxy: {
          outcome: 'misfit',
          code: 'proxy',
          patch: {
            removeWires: ['grinderApp->espressoApp'],
            add: {
              nodes: [skinned('proxy', node('machineProxy', 'EspressoMachineProxy', [7.5, 5.5]))],
              wires: [wire('grinderApp', 'machineProxy'), wire('machineProxy', 'espressoApp')],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, [], {}, 'counter'), pulse(0, ['app'], {}, 'app'), pulse(60, [], {}, 'counter'), pulse(60, ['app'], {}, 'app')],
    },
  ],
  changeTickets: [
    {
      id: 'preheat',
      scenario: 'main',
      without: {
        removeWires: ['grinder->espresso', 'grinderApp->espressoApp'],
        add: {
          nodes: [preheat('preheat', [7.5, -0.5]), preheat('preheatApp', [7.5, 5.5])],
          wires: [...chain('grinder', 'preheat', 'espresso'), ...chain('grinderApp', 'preheatApp', 'espressoApp')],
        },
      },
      with: {
        removeWires: ['grinder->espresso'],
        add: { nodes: [skinned('facade', preheat('preheat', [7.5, -0.5]))], wires: chain('grinder', 'preheat', 'espresso') },
      },
      code: { without: 'base_preheat', with: 'facade_preheat' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '<=', value: 1 },
  ],
  code: {
    rb: {
      base: code(base),
      base_preheat: code(basePreheat),
      facade: code(facade),
      facade_preheat: code(facadePreheat),
      adapter: code(base + adapter),
      proxy: code(base + proxy),
    },
    ts: {
      base: codeTs(tsBase),
      base_preheat: codeTs(tsBasePreheat),
      facade: codeTs(tsFacade),
      facade_preheat: codeTs(tsFacadePreheat),
      adapter: codeTs(tsBase + tsAdapter),
      proxy: codeTs(tsBase + tsProxy),
    },
    py: {
      base: codePy(pyBase),
      base_preheat: codePy(pyBasePreheat),
      facade: codePy(pyFacade),
      facade_preheat: codePy(pyFacadePreheat),
      adapter: codePy(pyBase + pyAdapter),
      proxy: codePy(pyBase + pyProxy),
    },
  },
})
