import { defineLevel, type NodeInput } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import basePreheat from './base_preheat.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import facadePreheat from './facade_preheat.rb?raw'
import proxy from './proxy.rb?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsBasePreheat from './ts/base_preheat.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsFacadePreheat from './ts/facade_preheat.ts?raw'
import tsProxy from './ts/proxy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const step = (id: string, label: string, className: string, codeRef: string, at: [number, number], tag: string): NodeInput =>
  node(id, label, className, at, { type: 'transform', addTags: [tag] }, { codeRef })
const preheat = (id: string, at: [number, number]) => step(id, 'Precalentar', 'EspressoMachine', 'EspressoMachine#preheat', at, 'preheated')

export default defineLevel({
  id: 'facade',
  order: 8,
  chapter: 'bar',
  title: 'La cocina por dentro',
  targetPattern: 'facade',
  brief: {
    problem: 'Para hacer un latte hay que usar molino, máquina y espumador en orden. El mostrador lo hace bien; la app de delivery copió los pasos y se saltó el espumador: sus lattes salen sin espuma.',
    goal: 'Que cualquier cliente pida un latte correcto sin conocer las máquinas, y que cambiar la cocina se haga en un solo lugar.',
  },
  circuit: {
    nodes: [
      actor('counter', 'Mostrador', [0, 1]),
      actor('app', 'App delivery', [0, 4]),
      step('grinder', 'Molino', 'Grinder', 'Grinder#grind', [6, 1], 'ground'),
      step('espresso', 'Máquina', 'EspressoMachine', 'EspressoMachine#extract', [9, 1], 'extracted'),
      step('frother', 'Espumador', 'MilkFrother', 'MilkFrother#froth', [12, 1], 'frothed'),
      step('grinderApp', 'Molino (app)', 'Grinder', 'DeliveryApp#make_latte', [6, 4], 'ground'),
      step('espressoApp', 'Máquina (app)', 'EspressoMachine', 'DeliveryApp#make_latte', [9, 4], 'extracted'),
      node('handOver', 'Entregar', 'Counter', [15, 2.5], { type: 'sink', expects: { all: [{ hasTag: 'ground' }, { hasTag: 'extracted' }, { hasTag: 'frothed' }] } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [...chain('counter', 'grinder', 'espresso', 'frother', 'handOver'), ...chain('app', 'grinderApp', 'espressoApp', 'handOver')],
  },
  sockets: [
    {
      id: 'kitchen',
      at: 'grinder',
      label: 'Cocina',
      inventory: ['facade', 'adapter', 'proxy'],
      options: {
        facade: {
          outcome: 'solves',
          code: 'facade',
          note: {
            title: 'Facade: una puerta simple a un subsistema complicado',
            body: 'Mostrador y app piden "un latte" a la fachada, y solo ella conoce el orden de las máquinas. La orquestación vive en un único lugar: nadie se salta un paso y un cambio en la cocina se hace una vez.',
          },
          patch: {
            remove: ['grinderApp', 'espressoApp'],
            removeWires: ['counter->grinder'],
            update: ['grinder', 'espresso', 'frother'].map((id) => ({ id, skin: 'facade' as const })),
            add: {
              nodes: [skinned('facade', node('kitchen', 'Cocina', 'KitchenFacade', [3, 2.5], { type: 'pass' }, { codeRef: 'KitchenFacade#latte' }))],
              wires: [wire('counter', 'kitchen'), wire('app', 'kitchen'), wire('kitchen', 'grinder')],
            },
          },
        },
        adapter: {
          outcome: 'misfit',
          code: 'adapter',
          note: {
            title: 'Adapter traduce la llamada, no la completa',
            body: 'Adaptar el pedido de la app al formato del mostrador no cambia que la app siga orquestando las máquinas por su cuenta, sin espumador.',
          },
          patch: {
            removeWires: ['app->grinderApp'],
            add: {
              nodes: [skinned('adapter', node('adapter', 'Adaptador', 'DeliveryRequestAdapter', [3, 4], { type: 'transform', setShape: 'square' }))],
              wires: [wire('app', 'adapter'), wire('adapter', 'grinderApp')],
            },
          },
        },
        proxy: {
          outcome: 'misfit',
          code: 'proxy',
          note: {
            title: 'Proxy controla el acceso, no la receta',
            body: 'Un intermediario frente a la máquina puede registrar o limitar su uso, pero no sabe que a la app le falta un paso de la receta.',
          },
          patch: {
            removeWires: ['grinderApp->espressoApp'],
            add: {
              nodes: [skinned('proxy', node('machineProxy', 'Proxy', 'EspressoMachineProxy', [7.5, 5.5]))],
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
      pulses: [pulse(0, 'Latte', [], {}, 'counter'), pulse(0, 'Latte (app)', ['app'], {}, 'app'), pulse(60, 'Latte', [], {}, 'counter'), pulse(60, 'Latte (app)', ['app'], {}, 'app')],
    },
  ],
  changeTickets: [
    {
      id: 'preheat',
      text: 'La máquina nueva necesita precalentarse antes de extraer.',
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
  },
})
