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
  id: 'L07-composite',
  order: 7,
  chapter: 'barra',
  title: 'Combos dentro de combos',
  targetPattern: 'composite',
  brief: {
    problem: 'El Desayuno trae café, pan y un Mini combo (jugo + fruta). La cocina pregunta "¿es producto o combo?" y solo sabe desarmar un nivel: el mini combo se pierde y la bandeja nunca se completa.',
    goal: 'Que la cocina prepare igual un producto suelto que un combo, tenga los niveles que tenga.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('cocina', 'Cocina', 'Kitchen', [3, 2], { type: 'branch', cases: { producto: 'directo', combo: 'combo' } }, { codeRef: 'Kitchen#prepare' }),
      node('desglosar', 'Desayuno', 'Combo', [6, 2], { type: 'broadcast' }, { codeRef: 'Combo#items' }),
      node('cafe', 'Café', 'Product', [9, 0], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('pan', 'Pan', 'Product', [9, 2], { type: 'pass' }, { codeRef: 'Product#make' }),
      node('mini', 'Mini combo', 'Combo', [9, 4], { type: 'branch', cases: {} }, { codeRef: 'Combo' }),
      node('bandeja', 'Juntar', 'Tray', [13, 2], { type: 'join' }, { codeRef: 'Tray#collect' }),
      node('servir', 'Servir', 'Tray', [16, 2], { type: 'pass' }, { codeRef: 'Tray#serve' }),
      node('entregar', 'Entregar', 'Counter', [19, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [
      wire('cliente', 'cocina'),
      wire('cocina', 'servir', { port: 'directo' }),
      wire('cocina', 'desglosar', { port: 'combo' }),
      wire('desglosar', 'cafe'),
      wire('desglosar', 'pan'),
      wire('desglosar', 'mini'),
      wire('cafe', 'bandeja'),
      wire('pan', 'bandeja'),
      wire('mini', 'bandeja'),
      wire('bandeja', 'servir'),
      wire('servir', 'entregar'),
    ],
  },
  sockets: [
    {
      id: 'combo',
      at: 'desglosar',
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
            removeWires: ['mini->bandeja'],
            update: [
              { id: 'desglosar', codeRef: 'Combo#make', skin: 'composite' },
              { id: 'mini', behavior: { type: 'broadcast' }, codeRef: 'Combo#make', skin: 'composite' },
              { id: 'cafe', skin: 'composite' },
              { id: 'pan', skin: 'composite' },
            ],
            add: {
              nodes: [
                leaf('jugo', 'Jugo', [11, 4]),
                leaf('fruta', 'Fruta', [11, 6]),
                skinned('composite', node('juntarMini', 'Juntar', 'Tray', [13, 5], { type: 'join' }, { codeRef: 'Tray#collect' })),
              ],
              wires: [wire('mini', 'jugo'), wire('mini', 'fruta'), wire('jugo', 'juntarMini'), wire('fruta', 'juntarMini'), wire('juntarMini', 'bandeja')],
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
            removeWires: ['desglosar->mini'],
            add: {
              nodes: [skinned('decorator', node('envuelto', 'Envuelto', 'GiftWrapped', [7, 5], { type: 'transform', addTags: ['envuelto'] }))],
              wires: [wire('desglosar', 'envuelto'), wire('envuelto', 'mini')],
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
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Café suelto', ['producto']), pulse(40, 'Desayuno', ['combo'])] }],
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
