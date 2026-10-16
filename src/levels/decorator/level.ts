import { defineLevel, type Predicate } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import baseCaramel from './base_caramel.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import decoratorCaramel from './decorator_caramel.rb?raw'
import strategy from './strategy.rb?raw'
import subclasses from './subclasses.rb?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseCaramel from './ts/base_caramel.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsDecoratorCaramel from './ts/decorator_caramel.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'
import tsSubclasses from './ts/subclasses.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const EXTRAS = ['oat', 'shot', 'cinnamon', 'caramel']

// Each requested extra must be applied (+extra) to the delivered drink.
const allExtrasApplied: Predicate = { all: EXTRAS.map((e) => ({ any: [{ not: { hasTag: e } }, { hasTag: `+${e}` }] })) }

const subclass = (id: string, label: string, className: string, y: number, extras: string[]) =>
  node(id, label, className, [10, y], { type: 'transform', addTags: extras.map((e) => `+${e}`) })

const wrapper = (id: string, label: string, className: string, x: number, extra: string) =>
  skinned('decorator', node(id, label, className, [x, 0], { type: 'transform', when: { hasTag: extra }, addTags: [`+${extra}`] }))

const order = (at: number, label: string, extras: string[]) => pulse(at, label, [`combo:${extras.join('-')}`, ...extras])

const main = [
  order(0, 'Latte + avena', ['oat']),
  order(40, 'Latte + shot', ['shot']),
  order(80, 'Latte + avena + shot', ['oat', 'shot']),
  order(120, 'Latte + avena + shot + canela', ['oat', 'shot', 'cinnamon']),
]

export default defineLevel({
  id: 'decorator',
  order: 6,
  chapter: 'bar',
  title: 'Extras sin fin',
  targetPattern: 'decorator',
  brief: {
    problem: 'Cada combinación de extras es una subclase: LatteConAvena, LatteConShot, LatteConAvenaYShot… Alguien pidió avena, shot y canela y esa clase no existe.',
    goal: 'Que cualquier combinación de extras funcione y que un extra nuevo no obligue a tocar el menú.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('take', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('menu', 'Menú', 'Menu', [6, 2], { type: 'branch', cases: { 'combo:oat': 'a', 'combo:shot': 's', 'combo:oat-shot': 'as' } }, { codeRef: 'Menu#drink_for' }),
      subclass('withOat', 'Con avena', 'OatMilkLatte', 0, ['oat']),
      subclass('withShot', 'Con shot', 'ShotLatte', 2, ['shot']),
      subclass('withOatShot', 'Avena y shot', 'OatShotLatte', 4, ['oat', 'shot']),
      node('prepare', 'Preparar', 'Barista', [15, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Entregar', 'Counter', [18, 2], { type: 'sink', expects: allExtrasApplied }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('customer', 'take'),
      wire('take', 'menu'),
      wire('menu', 'withOat', { port: 'a' }),
      wire('menu', 'withShot', { port: 's' }),
      wire('menu', 'withOatShot', { port: 'as' }),
      wire('withOat', 'prepare'),
      wire('withShot', 'prepare'),
      wire('withOatShot', 'prepare'),
      wire('prepare', 'handOver'),
    ],
  },
  sockets: [
    {
      id: 'extras',
      at: 'menu',
      label: 'Extras',
      inventory: ['decorator', 'strategy', 'adapter'],
      options: {
        decorator: {
          outcome: 'solves',
          code: 'decorator',
          note: {
            title: 'Decorator: envolturas que se apilan',
            body: 'Cada extra es una envoltura que suma su precio y su descripción y delega el resto. Se apilan en cualquier orden y cantidad: tres extras son tres envolturas, no ocho subclases.',
          },
          patch: {
            remove: ['withOat', 'withShot', 'withOatShot'],
            update: [{ id: 'menu', label: 'Latte', className: 'Latte', behavior: { type: 'pass' }, codeRef: 'Latte' }],
            add: {
              nodes: [wrapper('wOat', 'Con avena', 'WithOatMilk', 8, 'oat'), wrapper('wShot', 'Con shot', 'WithShot', 10, 'shot'), wrapper('wCinnamon', 'Con canela', 'WithCinnamon', 12, 'cinnamon')],
              wires: [abstract('menu', 'wOat'), abstract('wOat', 'wShot'), abstract('wShot', 'wCinnamon'), abstract('wCinnamon', 'prepare')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy elige una, Decorator acumula',
            body: 'La bebida recibe una estrategia de precio… una sola. Con dos o tres extras, todos menos el primero se pierden.',
          },
          patch: {
            remove: ['withOat', 'withShot', 'withOatShot'],
            update: [{ id: 'menu', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: {
              nodes: [
                skinned('strategy', node('pOat', 'Precio avena', 'OatMilkPricing', [10, 0], { type: 'transform', addTags: ['+oat'] })),
                skinned('strategy', node('pShot', 'Precio shot', 'ShotPricing', [10, 2], { type: 'transform', addTags: ['+shot'] })),
                skinned('strategy', node('pCinnamon', 'Precio canela', 'CinnamonPricing', [10, 4], { type: 'transform', addTags: ['+cinnamon'] })),
              ],
              wires: [
                abstract('menu', 'pOat', 'oat'),
                abstract('menu', 'pShot', 'shot'),
                abstract('menu', 'pCinnamon', 'cinnamon'),
                wire('pOat', 'prepare'),
                wire('pShot', 'prepare'),
                wire('pCinnamon', 'prepare'),
              ],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'adapter',
          note: {
            title: 'Adapter traduce, no compone',
            body: 'Adaptar el pedido al punto de venta viejo cambia el formato, pero el sistema viejo tampoco conoce la combinación con tres extras.',
          },
          patch: {
            removeWires: ['take->menu'],
            add: {
              nodes: [skinned('adapter', node('adapter', 'Adaptador', 'LegacyMenuAdapter', [4.5, 0], { type: 'transform', setShape: 'square' }))],
              wires: [wire('take', 'adapter'), wire('adapter', 'menu')],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: main },
    { id: 'with-caramel', pulses: [...main, order(160, 'Latte + caramelo + shot', ['caramel', 'shot'])] },
  ],
  changeTickets: [
    {
      id: 'caramel',
      text: 'Nuevo extra en el menú: caramelo.',
      scenario: 'with-caramel',
      without: {
        update: [{ id: 'menu', behavior: { type: 'branch', cases: { 'combo:oat': 'a', 'combo:shot': 's', 'combo:oat-shot': 'as', 'combo:caramel': 'c' } } }],
        add: {
          nodes: [subclass('withCaramel', 'Con caramelo', 'CaramelLatte', 6, ['caramel'])],
          wires: [wire('menu', 'withCaramel', { port: 'c' }), wire('withCaramel', 'prepare')],
        },
      },
      with: {
        removeWires: ['wCinnamon->prepare'],
        add: {
          nodes: [wrapper('wCaramel', 'Con caramelo', 'WithCaramel', 14, 'caramel')],
          wires: [abstract('wCinnamon', 'wCaramel'), abstract('wCaramel', 'prepare')],
        },
      },
      code: { without: 'base_caramel', with: 'decorator_caramel' },
    },
  ],
  winWhen: [
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(`${subclasses}\n${base}`),
      base_caramel: code(baseCaramel),
      decorator: code(decorator),
      decorator_caramel: code(decoratorCaramel),
      strategy: code(strategy),
      adapter: code(`${subclasses}\n${adapter}`),
    },
    ts: {
      base: codeTs(`${tsSubclasses}\n${tsBase}`),
      base_caramel: codeTs(tsBaseCaramel),
      decorator: codeTs(tsDecorator),
      decorator_caramel: codeTs(tsDecoratorCaramel),
      strategy: codeTs(tsStrategy),
      adapter: codeTs(`${tsSubclasses}\n${tsAdapter}`),
    },
  },
})
