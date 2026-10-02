import { defineLevel } from '../../engine'
import { actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import composite from './composite.rb?raw'
import decorator from './decorator.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsComposite from './ts/composite.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const leaf = (id: string, label: string, at: [number, number]) => skinned('composite', node(id, label, 'Product', at, { type: 'pass' }, { codeRef: 'Product#make' }))

export default defineLevel({
  id: 'composite',
  order: 7,
  chapter: 'bar',
  title: 'Combos dentro de combos',
  targetPattern: 'composite',
  brief: {
    problem: 'El Desayuno trae café, pan y un Mini combo (jugo + fruta). La cocina pregunta "¿es producto o combo?" y solo sabe desarmar un nivel: el mini combo se pierde y la bandeja nunca se completa.',
    goal: 'Que la cocina prepare igual un producto suelto que un combo, tenga los niveles que tenga.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('kitchen', 'Cocina', 'Kitchen', [3, 2], { type: 'branch', cases: { product: 'direct', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('unpack', 'Desayuno', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('coffee', 'Café', 'Product', [9, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('bread', 'Pan', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Mini combo', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('tray', 'Juntar', 'Tray', [13, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('serve', 'Servir', 'Tray', [16, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('handOver', 'Entregar', 'Counter', [19, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
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
      label: 'Combos',
      inventory: ['composite', 'decorator', 'strategy'],
      options: {
        composite: {
          outcome: 'solves',
          code: 'composite',
          note: {
            title: 'Composite: la hoja y el grupo se tratan igual',
            body: 'Producto y Combo responden al mismo mensaje. Un combo reparte el trabajo entre sus partes y junta lo que le devuelven, sin importar si esas partes son productos u otros combos.',
          },
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
                leaf('juice', 'Jugo', [11, 4]),
                leaf('fruit', 'Fruta', [11, 6]),
                skinned('composite', node('joinMini', 'Juntar', 'Tray', [13, 5], { type: 'join' }, { codeRef: 'Tray#collect' })),
              ],
              wires: [wire('mini', 'juice'), wire('mini', 'fruit'), wire('juice', 'joinMini'), wire('fruit', 'joinMini'), wire('joinMini', 'tray')],
            },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          note: {
            title: 'Decorator envuelve, no desarma',
            body: 'Envolver el mini combo le añade algo por fuera, pero la cocina sigue sin saber qué hacer con un combo dentro de otro.',
          },
          patch: {
            removeWires: ['unpack->mini'],
            add: {
              nodes: [skinned('decorator', node('wrapped', 'Envuelto', 'GiftWrapped', [7, 5], { type: 'transform', addTags: ['wrapped'] }))],
              wires: [wire('unpack', 'wrapped'), wire('wrapped', 'mini')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy elige cómo, pero no recursa',
            body: 'Una estrategia por tipo de ítem sigue siendo un "si es combo, haz esto". Ninguna estrategia sabe que un combo puede traer otro adentro.',
          },
          patch: { update: [{ id: 'mini', behavior: { type: 'slot' }, codeRef: 'ComboStrategy', skin: 'strategy' }] },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Café suelto', ['product']), pulse(40, 'Desayuno', ['combo'])] }],
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
  },
})
