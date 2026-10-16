import { defineLevel } from '../../engine'
import { actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import composite from './composite.rb?raw'
import decorator from './decorator.rb?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyComposite from './py/composite.py?raw'
import pyDecorator from './py/decorator.py?raw'
import pyStrategy from './py/strategy.py?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsComposite from './ts/composite.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const leaf = (id: string, at: [number, number]) => skinned('composite', node(id, 'Product', at, { type: 'pass' }, { codeRef: 'Product#make' }))

export default defineLevel({
  id: 'composite',
  order: 7,
  chapter: 'bar',
  targetPattern: 'composite',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('kitchen', 'Kitchen', [3, 2], { type: 'branch', cases: { product: 'direct', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('unpack', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('coffee', 'Product', [9, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('bread', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('tray', 'Tray', [13, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('serve', 'Tray', [16, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('handOver', 'Counter', [19, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('customer', 'kitchen'),
      wire('kitchen', 'serve', { port: 'direct' }),
      wire('kitchen', 'unpack', { port: 'combo' }),
      wire('unpack', 'coffee'),
      wire('unpack', 'bread'),
      wire('unpack', 'mini'),
      wire('coffee', 'tray'),
      wire('bread', 'tray'),
      wire('mini', 'tray'),
      wire('tray', 'serve'),
      wire('serve', 'handOver'),
    ],
  },
  sockets: [
    {
      id: 'combo',
      at: 'unpack',
      inventory: ['composite', 'decorator', 'strategy'],
      options: {
        composite: {
          outcome: 'solves',
          code: 'composite',
          patch: {
            removeWires: ['mini->tray'],
            update: [
              { id: 'unpack', codeRef: 'Combo#make', skin: 'composite' },
              { id: 'mini', behavior: { type: 'broadcast' }, codeRef: 'Combo#make', skin: 'composite' },
              { id: 'coffee', skin: 'composite' },
              { id: 'bread', skin: 'composite' },
            ],
            add: {
              nodes: [
                leaf('juice', [11, 4]),
                leaf('fruit', [11, 6]),
                skinned('composite', node('joinMini', 'Tray', [13, 5], { type: 'join' }, { codeRef: 'Tray#collect' })),
              ],
              wires: [wire('mini', 'juice'), wire('mini', 'fruit'), wire('juice', 'joinMini'), wire('fruit', 'joinMini'), wire('joinMini', 'tray')],
            },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          patch: {
            removeWires: ['unpack->mini'],
            add: {
              nodes: [skinned('decorator', node('wrapped', 'GiftWrapped', [7, 5], { type: 'transform', addTags: ['wrapped'] }))],
              wires: [wire('unpack', 'wrapped'), wire('wrapped', 'mini')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          patch: { update: [{ id: 'mini', behavior: { type: 'slot' }, codeRef: 'ComboStrategy', skin: 'strategy' }] },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, ['product']), pulse(40, ['combo'])] }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 2 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'duplicatesAtSink', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      composite: code(composite),
      decorator: code(base + decorator),
      strategy: code(base + strategy),
    },
    ts: {
      base: codeTs(tsBase),
      composite: codeTs(tsComposite),
      decorator: codeTs(tsBase + tsDecorator),
      strategy: codeTs(tsBase + tsStrategy),
    },
    py: {
      base: codePy(pyBase),
      composite: codePy(pyComposite),
      decorator: codePy(pyBase + pyDecorator),
      strategy: codePy(pyBase + pyStrategy),
    },
  },
})
