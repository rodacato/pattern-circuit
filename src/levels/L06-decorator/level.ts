import { defineLevel, type Predicate } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import baseCaramelo from './base_caramelo.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import decoratorCaramelo from './decorator_caramelo.rb?raw'
import strategy from './strategy.rb?raw'
import subclasses from './subclasses.rb?raw'

const code = withCommon(common)
const EXTRAS = ['avena', 'shot', 'canela', 'caramelo']

// Cada extra pedido tiene que estar aplicado (+extra) en la bebida entregada.
const allExtrasApplied: Predicate = { all: EXTRAS.map((e) => ({ any: [{ not: { hasTag: e } }, { hasTag: `+${e}` }] })) }

const subclass = (id: string, label: string, className: string, y: number, extras: string[]) =>
  node(id, label, className, [10, y], { type: 'transform', addTags: extras.map((e) => `+${e}`) })

const wrapper = (id: string, label: string, className: string, x: number, extra: string) =>
  skinned('decorator', node(id, label, className, [x, 0], { type: 'transform', when: { hasTag: extra }, addTags: [`+${extra}`] }))

const order = (at: number, label: string, extras: string[]) => pulse(at, label, [`combo:${extras.join('-')}`, ...extras])

const main = [
  order(0, 'Latte + avena', ['avena']),
  order(40, 'Latte + shot', ['shot']),
  order(80, 'Latte + avena + shot', ['avena', 'shot']),
  order(120, 'Latte + avena + shot + canela', ['avena', 'shot', 'canela']),
]

export default defineLevel({
  id: 'L06-decorator',
  order: 6,
  chapter: 'barra',
  title: 'Extras sin fin',
  targetPattern: 'decorator',
  brief: {
    problem: 'Cada combinación de extras es una subclase: LatteConAvena, LatteConShot, LatteConAvenaYShot… Alguien pidió avena, shot y canela y esa clase no existe.',
    goal: 'Que cualquier combinación de extras funcione y que un extra nuevo no obligue a tocar el menú.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('menu', 'Menú', 'Menu', [6, 2], { type: 'branch', cases: { 'combo:avena': 'a', 'combo:shot': 's', 'combo:avena-shot': 'as' } }, { codeRef: 'Menu#drink_for' }),
      subclass('conAvena', 'Con avena', 'LatteConAvena', 0, ['avena']),
      subclass('conShot', 'Con shot', 'LatteConShot', 2, ['shot']),
      subclass('conAvenaShot', 'Avena y shot', 'LatteConAvenaYShot', 4, ['avena', 'shot']),
      node('preparar', 'Preparar', 'Barista', [15, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [18, 2], { type: 'sink', expects: allExtrasApplied }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('cliente', 'tomar'),
      wire('tomar', 'menu'),
      wire('menu', 'conAvena', { port: 'a' }),
      wire('menu', 'conShot', { port: 's' }),
      wire('menu', 'conAvenaShot', { port: 'as' }),
      wire('conAvena', 'preparar'),
      wire('conShot', 'preparar'),
      wire('conAvenaShot', 'preparar'),
      wire('preparar', 'entregar'),
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
            remove: ['conAvena', 'conShot', 'conAvenaShot'],
            update: [{ id: 'menu', label: 'Latte', className: 'Latte', behavior: { type: 'pass' }, codeRef: 'Latte' }],
            add: {
              nodes: [wrapper('wAvena', 'Con avena', 'WithOatMilk', 8, 'avena'), wrapper('wShot', 'Con shot', 'WithShot', 10, 'shot'), wrapper('wCanela', 'Con canela', 'WithCinnamon', 12, 'canela')],
              wires: [abstract('menu', 'wAvena'), abstract('wAvena', 'wShot'), abstract('wShot', 'wCanela'), abstract('wCanela', 'preparar')],
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
            remove: ['conAvena', 'conShot', 'conAvenaShot'],
            update: [{ id: 'menu', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: {
              nodes: [
                skinned('strategy', node('pAvena', 'Precio avena', 'OatMilkPricing', [10, 0], { type: 'transform', addTags: ['+avena'] })),
                skinned('strategy', node('pShot', 'Precio shot', 'ShotPricing', [10, 2], { type: 'transform', addTags: ['+shot'] })),
                skinned('strategy', node('pCanela', 'Precio canela', 'CinnamonPricing', [10, 4], { type: 'transform', addTags: ['+canela'] })),
              ],
              wires: [
                abstract('menu', 'pAvena', 'avena'),
                abstract('menu', 'pShot', 'shot'),
                abstract('menu', 'pCanela', 'canela'),
                wire('pAvena', 'preparar'),
                wire('pShot', 'preparar'),
                wire('pCanela', 'preparar'),
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
            removeWires: ['tomar->menu'],
            add: {
              nodes: [skinned('adapter', node('adaptador', 'Adaptador', 'LegacyMenuAdapter', [4.5, 0], { type: 'transform', setShape: 'square' }))],
              wires: [wire('tomar', 'adaptador'), wire('adaptador', 'menu')],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: main },
    { id: 'con-caramelo', pulses: [...main, order(160, 'Latte + caramelo + shot', ['caramelo', 'shot'])] },
  ],
  changeTickets: [
    {
      id: 'caramelo',
      text: 'Nuevo extra en el menú: caramelo.',
      scenario: 'con-caramelo',
      without: {
        update: [{ id: 'menu', behavior: { type: 'branch', cases: { 'combo:avena': 'a', 'combo:shot': 's', 'combo:avena-shot': 'as', 'combo:caramelo': 'c' } } }],
        add: {
          nodes: [subclass('conCaramelo', 'Con caramelo', 'LatteConCaramelo', 6, ['caramelo'])],
          wires: [wire('menu', 'conCaramelo', { port: 'c' }), wire('conCaramelo', 'preparar')],
        },
      },
      with: {
        removeWires: ['wCanela->preparar'],
        add: {
          nodes: [wrapper('wCaramelo', 'Con caramelo', 'WithCaramel', 14, 'caramelo')],
          wires: [abstract('wCanela', 'wCaramelo'), abstract('wCaramelo', 'preparar')],
        },
      },
      code: { without: 'base_caramelo', with: 'decorator_caramelo' },
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
      base_caramelo: code(baseCaramelo),
      decorator: code(decorator),
      decorator_caramelo: code(decoratorCaramelo),
      strategy: code(strategy),
      adapter: code(`${subclasses}\n${adapter}`),
    },
  },
})
