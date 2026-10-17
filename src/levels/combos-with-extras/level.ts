import { defineLevel, type Predicate } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import comboBase from '../composite/base.rb?raw'
import common from '../composite/common.rb?raw'
import comboComposite from '../composite/composite.rb?raw'
import comboStrategy from '../composite/strategy.rb?raw'
import comboFacade from './combo_facade.rb?raw'
import extrasAdapter from './extras_adapter.rb?raw'
import extrasBase from './extras_base.rb?raw'
import extrasDecorator from './extras_decorator.rb?raw'
import extrasLattes from './extras_lattes.rb?raw'
import extrasSingleton from './extras_singleton.rb?raw'
import pyComboBase from '../composite/py/base.py?raw'
import pyCommon from '../composite/py/common.py?raw'
import pyComboComposite from '../composite/py/composite.py?raw'
import pyComboStrategy from '../composite/py/strategy.py?raw'
import pyComboFacade from './py/combo_facade.py?raw'
import pyExtrasAdapter from './py/extras_adapter.py?raw'
import pyExtrasBase from './py/extras_base.py?raw'
import pyExtrasDecorator from './py/extras_decorator.py?raw'
import pyExtrasLattes from './py/extras_lattes.py?raw'
import pyExtrasSingleton from './py/extras_singleton.py?raw'
import tsComboBase from '../composite/ts/base.ts?raw'
import tsCommon from '../composite/ts/common.ts?raw'
import tsComboComposite from '../composite/ts/composite.ts?raw'
import tsComboStrategy from '../composite/ts/strategy.ts?raw'
import tsComboFacade from './ts/combo_facade.ts?raw'
import tsExtrasAdapter from './ts/extras_adapter.ts?raw'
import tsExtrasBase from './ts/extras_base.ts?raw'
import tsExtrasDecorator from './ts/extras_decorator.ts?raw'
import tsExtrasLattes from './ts/extras_lattes.ts?raw'
import tsExtrasSingleton from './ts/extras_singleton.ts?raw'

const EXTRAS = ['oat', 'shot']
const extrasApplied: Predicate = { all: EXTRAS.map((e) => ({ any: [{ not: { hasTag: e } }, { hasTag: `+${e}` }] })) }
const leaf = (id: string, at: [number, number]) => skinned('composite', node(id, 'Product', at, { type: 'pass' }, { codeRef: 'Product#make' }))
const wrapper = (id: string, className: string, y: number, extra: string) =>
  skinned('decorator', node(id, className, [11, y], { type: 'transform', when: { hasTag: extra }, addTags: [`+${extra}`] }))

export default defineLevel({
  id: 'combos-with-extras',
  order: 16,
  chapter: 'all-together',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('kitchen', 'Kitchen', [3, 2], { type: 'branch', cases: { product: 'direct', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('unpack', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('coffee', 'CoffeeMenu', [9, 0], { type: 'branch', cases: { oat: 'a', shot: 's' } }, { codeRef: 'CoffeeMenu#drink_for' }),
      node('withOat', 'OatMilkLatte', [11, -1], { type: 'transform', addTags: ['+oat'] }),
      node('withShot', 'ShotLatte', [11, 1], { type: 'transform', addTags: ['+shot'] }),
      node('coffeeReady', 'Product', [13.5, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('bread', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('tray', 'Tray', [16, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('serve', 'Tray', [18.5, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('handOver', 'Counter', [21, 2], { type: 'sink', expects: extrasApplied }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('customer', 'kitchen'),
      wire('kitchen', 'serve', { port: 'direct' }),
      wire('kitchen', 'unpack', { port: 'combo' }),
      wire('unpack', 'coffee'),
      wire('unpack', 'bread'),
      wire('unpack', 'mini'),
      wire('coffee', 'withOat', { port: 'a' }),
      wire('coffee', 'withShot', { port: 's' }),
      wire('withOat', 'coffeeReady'),
      wire('withShot', 'coffeeReady'),
      wire('coffeeReady', 'tray'),
      wire('bread', 'tray'),
      wire('mini', 'tray'),
      ...chain('tray', 'serve', 'handOver'),
    ],
  },
  sockets: [
    {
      id: 'combo',
      at: 'unpack',
      code: 'combo_base',
      inventory: ['composite', 'strategy', 'facade'],
      options: {
        composite: {
          outcome: 'solves',
          code: 'combo_composite',
          patch: {
            removeWires: ['mini->tray'],
            update: [
              { id: 'unpack', codeRef: 'Combo#make', skin: 'composite' },
              { id: 'mini', behavior: { type: 'broadcast' }, codeRef: 'Combo#make', skin: 'composite' },
              { id: 'bread', skin: 'composite' },
            ],
            add: {
              nodes: [leaf('juice', [11, 4]), leaf('fruit', [11, 6]), skinned('composite', node('joinMini', 'Tray', [13.5, 5], { type: 'join' }, { codeRef: 'Tray#collect' }))],
              wires: [wire('mini', 'juice'), wire('mini', 'fruit'), wire('juice', 'joinMini'), wire('fruit', 'joinMini'), wire('joinMini', 'tray')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'combo_strategy',
          patch: { update: [{ id: 'mini', behavior: { type: 'slot' }, codeRef: 'ComboStrategy', skin: 'strategy' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'combo_facade',
          patch: {
            removeWires: ['kitchen.combo->unpack'],
            add: {
              nodes: [skinned('facade', node('desk', 'ComboDesk', [4.5, 4.5], { type: 'pass' }, { codeRef: 'ComboDesk' }))],
              wires: [wire('kitchen', 'desk', { port: 'combo' }), wire('desk', 'unpack')],
            },
          },
        },
      },
    },
    {
      id: 'extras',
      at: 'coffee',
      code: 'extras_base',
      inventory: ['decorator', 'adapter', 'singleton'],
      options: {
        decorator: {
          outcome: 'solves',
          code: 'extras_decorator',
          patch: {
            remove: ['withOat', 'withShot'],
            update: [{ id: 'coffee', behavior: { type: 'pass' }, className: 'Latte', skin: 'composite' }],
            add: {
              nodes: [wrapper('wOat', 'WithOatMilk', -1, 'oat'), wrapper('wShot', 'WithShot', 1, 'shot')],
              wires: [abstract('coffee', 'wOat'), abstract('wOat', 'wShot'), abstract('wShot', 'coffeeReady')],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'extras_adapter',
          patch: { update: [{ id: 'coffee', skin: 'adapter' }] },
        },
        singleton: {
          outcome: 'misfit',
          code: 'extras_singleton',
          patch: { update: [{ id: 'coffee', skin: 'singleton' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, ['product']), pulse(40, ['combo', 'oat']), pulse(80, ['combo', 'oat', 'shot'])],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: common,
      combo_base: comboBase,
      combo_composite: comboComposite,
      combo_strategy: comboBase + comboStrategy,
      combo_facade: comboBase + comboFacade,
      extras_base: extrasBase + extrasLattes,
      extras_decorator: extrasDecorator,
      extras_adapter: extrasAdapter + extrasLattes,
      extras_singleton: extrasSingleton + extrasLattes,
    },
    ts: {
      base: tsCommon,
      combo_base: tsComboBase,
      combo_composite: tsComboComposite,
      combo_strategy: tsComboBase + tsComboStrategy,
      combo_facade: tsComboBase + tsComboFacade,
      extras_base: tsExtrasBase + tsExtrasLattes,
      extras_decorator: tsExtrasDecorator,
      extras_adapter: tsExtrasAdapter + tsExtrasLattes,
      extras_singleton: tsExtrasSingleton + tsExtrasLattes,
    },
    py: {
      base: pyCommon,
      combo_base: pyComboBase,
      combo_composite: pyComboComposite,
      combo_strategy: pyComboBase + pyComboStrategy,
      combo_facade: pyComboBase + pyComboFacade,
      extras_base: pyExtrasBase + pyExtrasLattes,
      extras_decorator: pyExtrasDecorator,
      extras_adapter: pyExtrasAdapter + pyExtrasLattes,
      extras_singleton: pyExtrasSingleton + pyExtrasLattes,
    },
  },
})
