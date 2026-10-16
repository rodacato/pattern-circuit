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
import extrasSingleton from './extras_singleton.rb?raw'
import tsComboBase from '../composite/ts/base.ts?raw'
import tsCommon from '../composite/ts/common.ts?raw'
import tsComboComposite from '../composite/ts/composite.ts?raw'
import tsComboStrategy from '../composite/ts/strategy.ts?raw'
import tsComboFacade from './ts/combo_facade.ts?raw'
import tsExtrasAdapter from './ts/extras_adapter.ts?raw'
import tsExtrasBase from './ts/extras_base.ts?raw'
import tsExtrasDecorator from './ts/extras_decorator.ts?raw'
import tsExtrasSingleton from './ts/extras_singleton.ts?raw'

const EXTRAS = ['oat', 'shot']
const extrasApplied: Predicate = { all: EXTRAS.map((e) => ({ any: [{ not: { hasTag: e } }, { hasTag: `+${e}` }] })) }
const leaf = (id: string, label: string, at: [number, number]) => skinned('composite', node(id, label, 'Product', at, { type: 'pass' }, { codeRef: 'Product#make' }))
const wrapper = (id: string, label: string, className: string, y: number, extra: string) =>
  skinned('decorator', node(id, label, className, [11, y], { type: 'transform', when: { hasTag: extra }, addTags: [`+${extra}`] }))

export default defineLevel({
  id: 'combos-with-extras',
  order: 16,
  chapter: 'all-together',
  title: 'Combos con extras',
  brief: {
    problem: 'El Desayuno trae un café con extras, pan y un mini combo. La cocina no sabe desarmar el combo anidado, y el menú del café solo conoce una subclase por extra: avena y shot a la vez no existe.',
    goal: 'Que el combo completo llegue a la bandeja con todos los extras del café aplicados.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('kitchen', 'Cocina', 'Kitchen', [3, 2], { type: 'branch', cases: { product: 'direct', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('unpack', 'Desayuno', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('coffee', 'Café', 'CoffeeMenu', [9, 0], { type: 'branch', cases: { oat: 'a', shot: 's' } }, { codeRef: 'CoffeeMenu#drink_for' }),
      node('withOat', 'Con avena', 'OatMilkLatte', [11, -1], { type: 'transform', addTags: ['+oat'] }),
      node('withShot', 'Con shot', 'ShotLatte', [11, 1], { type: 'transform', addTags: ['+shot'] }),
      node('coffeeReady', 'Café listo', 'Product', [13.5, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('bread', 'Pan', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Mini combo', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('tray', 'Juntar', 'Tray', [16, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('serve', 'Servir', 'Tray', [18.5, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('handOver', 'Entregar', 'Counter', [21, 2], { type: 'sink', expects: extrasApplied }, { codeRef: 'Counter#hand_over' }),
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
      label: 'Combos',
      code: 'combo_base',
      inventory: ['composite', 'strategy', 'facade'],
      options: {
        composite: {
          outcome: 'solves',
          code: 'combo_composite',
          note: {
            title: 'Composite recorre el árbol',
            body: 'El combo trata igual a sus partes, sean productos u otros combos. Que una de esas partes sea un café decorado no le importa: sigue respondiendo al mismo mensaje.',
          },
          patch: {
            removeWires: ['mini->tray'],
            update: [
              { id: 'unpack', codeRef: 'Combo#make', skin: 'composite' },
              { id: 'mini', behavior: { type: 'broadcast' }, codeRef: 'Combo#make', skin: 'composite' },
              { id: 'bread', skin: 'composite' },
            ],
            add: {
              nodes: [leaf('juice', 'Jugo', [11, 4]), leaf('fruit', 'Fruta', [11, 6]), skinned('composite', node('joinMini', 'Juntar', 'Tray', [13.5, 5], { type: 'join' }, { codeRef: 'Tray#collect' }))],
              wires: [wire('mini', 'juice'), wire('mini', 'fruit'), wire('juice', 'joinMini'), wire('fruit', 'joinMini'), wire('joinMini', 'tray')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'combo_strategy',
          note: { title: 'Strategy no recursa', body: 'Una estrategia por tipo de ítem sigue sin saber qué hacer con un combo dentro de otro.' },
          patch: { update: [{ id: 'mini', behavior: { type: 'slot' }, codeRef: 'ComboStrategy', skin: 'strategy' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'combo_facade',
          note: { title: 'Facade no cambia lo que hay detrás', body: 'Una ventanilla única para pedir combos simplifica la entrada, pero la cocina de atrás sigue sin desarmar el combo anidado.' },
          patch: {
            removeWires: ['kitchen.combo->unpack'],
            add: {
              nodes: [skinned('facade', node('desk', 'Ventanilla', 'ComboDesk', [4.5, 4.5], { type: 'pass' }, { codeRef: 'ComboDesk' }))],
              wires: [wire('kitchen', 'desk', { port: 'combo' }), wire('desk', 'unpack')],
            },
          },
        },
      },
    },
    {
      id: 'extras',
      at: 'coffee',
      label: 'Extras',
      code: 'extras_base',
      inventory: ['decorator', 'adapter', 'singleton'],
      options: {
        decorator: {
          outcome: 'solves',
          code: 'extras_decorator',
          note: {
            title: 'Decorator apila los extras',
            body: 'El café se envuelve con cada extra y sigue siendo una hoja más del combo. Composite organiza el árbol; Decorator enriquece una hoja sin que el árbol se entere.',
          },
          patch: {
            remove: ['withOat', 'withShot'],
            update: [{ id: 'coffee', behavior: { type: 'pass' }, className: 'Latte', skin: 'composite' }],
            add: {
              nodes: [wrapper('wOat', 'Con avena', 'WithOatMilk', -1, 'oat'), wrapper('wShot', 'Con shot', 'WithShot', 1, 'shot')],
              wires: [abstract('coffee', 'wOat'), abstract('wOat', 'wShot'), abstract('wShot', 'coffeeReady')],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'extras_adapter',
          note: { title: 'Adapter traduce, no compone', body: 'Adaptar el pedido al punto de venta viejo no hace que exista la combinación de dos extras.' },
          patch: { update: [{ id: 'coffee', skin: 'adapter' }] },
        },
        singleton: {
          outcome: 'misfit',
          code: 'extras_singleton',
          note: { title: 'Singleton comparte, no combina', body: 'Un único menú compartido sigue eligiendo una sola subclase por café.' },
          patch: { update: [{ id: 'coffee', skin: 'singleton' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Café suelto', ['product']), pulse(40, 'Desayuno (café con avena)', ['combo', 'oat']), pulse(80, 'Desayuno (avena + shot)', ['combo', 'oat', 'shot'])],
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
      extras_base: extrasBase,
      extras_decorator: extrasDecorator,
      extras_adapter: extrasBase + extrasAdapter,
      extras_singleton: extrasBase + extrasSingleton,
    },
    ts: {
      base: tsCommon,
      combo_base: tsComboBase,
      combo_composite: tsComboComposite,
      combo_strategy: tsComboBase + tsComboStrategy,
      combo_facade: tsComboBase + tsComboFacade,
      extras_base: tsExtrasBase,
      extras_decorator: tsExtrasDecorator,
      extras_adapter: tsExtrasBase + tsExtrasAdapter,
      extras_singleton: tsExtrasBase + tsExtrasSingleton,
    },
  },
})
