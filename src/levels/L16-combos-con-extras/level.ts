import { defineLevel, type Predicate } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import comboBase from '../L07-composite/base.rb?raw'
import common from '../L07-composite/common.rb?raw'
import comboComposite from '../L07-composite/composite.rb?raw'
import comboStrategy from '../L07-composite/strategy.rb?raw'
import comboFacade from './combo_facade.rb?raw'
import extrasAdapter from './extras_adapter.rb?raw'
import extrasBase from './extras_base.rb?raw'
import extrasDecorator from './extras_decorator.rb?raw'
import extrasSingleton from './extras_singleton.rb?raw'

const EXTRAS = ['avena', 'shot']
const extrasApplied: Predicate = { all: EXTRAS.map((e) => ({ any: [{ not: { hasTag: e } }, { hasTag: `+${e}` }] })) }
const leaf = (id: string, label: string, at: [number, number]) => skinned('composite', node(id, label, 'Product', at, { type: 'pass' }, { codeRef: 'Product#make' }))
const wrapper = (id: string, label: string, className: string, y: number, extra: string) =>
  skinned('decorator', node(id, label, className, [11, y], { type: 'transform', when: { hasTag: extra }, addTags: [`+${extra}`] }))

export default defineLevel({
  id: 'L16-combos-con-extras',
  order: 16,
  chapter: 'todo-junto',
  title: 'Combos con extras',
  brief: {
    problem: 'El Desayuno trae un café con extras, pan y un mini combo. La cocina no sabe desarmar el combo anidado, y el menú del café solo conoce una subclase por extra: avena y shot a la vez no existe.',
    goal: 'Que el combo completo llegue a la bandeja con todos los extras del café aplicados.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('cocina', 'Cocina', 'Kitchen', [3, 2], { type: 'branch', cases: { producto: 'directo', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('desglosar', 'Desayuno', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('cafe', 'Café', 'CoffeeMenu', [9, 0], { type: 'branch', cases: { avena: 'a', shot: 's' } }, { codeRef: 'CoffeeMenu#drink_for' }),
      node('conAvena', 'Con avena', 'LatteConAvena', [11, -1], { type: 'transform', addTags: ['+avena'] }),
      node('conShot', 'Con shot', 'LatteConShot', [11, 1], { type: 'transform', addTags: ['+shot'] }),
      node('cafeListo', 'Café listo', 'Product', [13.5, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('pan', 'Pan', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Mini combo', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('bandeja', 'Juntar', 'Tray', [16, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('servir', 'Servir', 'Tray', [18.5, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('entregar', 'Entregar', 'Counter', [21, 2], { type: 'sink', expects: extrasApplied }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('cliente', 'cocina'),
      wire('cocina', 'servir', { port: 'directo' }),
      wire('cocina', 'desglosar', { port: 'combo' }),
      wire('desglosar', 'cafe'),
      wire('desglosar', 'pan'),
      wire('desglosar', 'mini'),
      wire('cafe', 'conAvena', { port: 'a' }),
      wire('cafe', 'conShot', { port: 's' }),
      wire('conAvena', 'cafeListo'),
      wire('conShot', 'cafeListo'),
      wire('cafeListo', 'bandeja'),
      wire('pan', 'bandeja'),
      wire('mini', 'bandeja'),
      ...chain('bandeja', 'servir', 'entregar'),
    ],
  },
  sockets: [
    {
      id: 'combo',
      at: 'desglosar',
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
            removeWires: ['mini->bandeja'],
            update: [
              { id: 'desglosar', codeRef: 'Combo#make', skin: 'composite' },
              { id: 'mini', behavior: { type: 'broadcast' }, codeRef: 'Combo#make', skin: 'composite' },
              { id: 'pan', skin: 'composite' },
            ],
            add: {
              nodes: [leaf('jugo', 'Jugo', [11, 4]), leaf('fruta', 'Fruta', [11, 6]), skinned('composite', node('juntarMini', 'Juntar', 'Tray', [13.5, 5], { type: 'join' }, { codeRef: 'Tray#collect' }))],
              wires: [wire('mini', 'jugo'), wire('mini', 'fruta'), wire('jugo', 'juntarMini'), wire('fruta', 'juntarMini'), wire('juntarMini', 'bandeja')],
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
            removeWires: ['cocina.combo->desglosar'],
            add: {
              nodes: [skinned('facade', node('ventanilla', 'Ventanilla', 'ComboDesk', [4.5, 4.5], { type: 'pass' }, { codeRef: 'ComboDesk' }))],
              wires: [wire('cocina', 'ventanilla', { port: 'combo' }), wire('ventanilla', 'desglosar')],
            },
          },
        },
      },
    },
    {
      id: 'extras',
      at: 'cafe',
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
            remove: ['conAvena', 'conShot'],
            update: [{ id: 'cafe', behavior: { type: 'pass' }, className: 'Latte', skin: 'composite' }],
            add: {
              nodes: [wrapper('wAvena', 'Con avena', 'WithOatMilk', -1, 'avena'), wrapper('wShot', 'Con shot', 'WithShot', 1, 'shot')],
              wires: [abstract('cafe', 'wAvena'), abstract('wAvena', 'wShot'), abstract('wShot', 'cafeListo')],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'extras_adapter',
          note: { title: 'Adapter traduce, no compone', body: 'Adaptar el pedido al punto de venta viejo no hace que exista la combinación de dos extras.' },
          patch: { update: [{ id: 'cafe', skin: 'adapter' }] },
        },
        singleton: {
          outcome: 'misfit',
          code: 'extras_singleton',
          note: { title: 'Singleton comparte, no combina', body: 'Un único menú compartido sigue eligiendo una sola subclase por café.' },
          patch: { update: [{ id: 'cafe', skin: 'singleton' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Café suelto', ['producto']), pulse(40, 'Desayuno (café con avena)', ['combo', 'avena']), pulse(80, 'Desayuno (avena + shot)', ['combo', 'avena', 'shot'])],
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
  },
})
