import { defineLevel, type NodeInput } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import basePrecalentar from './base_precalentar.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import facadePrecalentar from './facade_precalentar.rb?raw'
import proxy from './proxy.rb?raw'

const code = withCommon(common)
const step = (id: string, label: string, className: string, codeRef: string, at: [number, number], tag: string): NodeInput =>
  node(id, label, className, at, { type: 'transform', addTags: [tag] }, { codeRef })
const preheat = (id: string, at: [number, number]) => step(id, 'Precalentar', 'EspressoMachine', 'EspressoMachine#preheat', at, 'precalentado')

export default defineLevel({
  id: 'L08-facade',
  order: 8,
  chapter: 'barra',
  title: 'La cocina por dentro',
  targetPattern: 'facade',
  brief: {
    problem: 'Para hacer un latte hay que usar molino, máquina y espumador en orden. El mostrador lo hace bien; la app de delivery copió los pasos y se saltó el espumador: sus lattes salen sin espuma.',
    goal: 'Que cualquier cliente pida un latte correcto sin conocer las máquinas, y que cambiar la cocina se haga en un solo lugar.',
  },
  circuit: {
    nodes: [
      actor('mostrador', 'Mostrador', [0, 1]),
      actor('app', 'App delivery', [0, 4]),
      step('molino', 'Molino', 'Grinder', 'Grinder#grind', [6, 1], 'molido'),
      step('espresso', 'Máquina', 'EspressoMachine', 'EspressoMachine#extract', [9, 1], 'extraido'),
      step('espumador', 'Espumador', 'MilkFrother', 'MilkFrother#froth', [12, 1], 'espumado'),
      step('molinoApp', 'Molino (app)', 'Grinder', 'DeliveryApp#make_latte', [6, 4], 'molido'),
      step('espressoApp', 'Máquina (app)', 'EspressoMachine', 'DeliveryApp#make_latte', [9, 4], 'extraido'),
      node('entregar', 'Entregar', 'Counter', [15, 2.5], { type: 'sink', expects: { all: [{ hasTag: 'molido' }, { hasTag: 'extraido' }, { hasTag: 'espumado' }] } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [...chain('mostrador', 'molino', 'espresso', 'espumador', 'entregar'), ...chain('app', 'molinoApp', 'espressoApp', 'entregar')],
  },
  sockets: [
    {
      id: 'cocina',
      at: 'molino',
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
            remove: ['molinoApp', 'espressoApp'],
            removeWires: ['mostrador->molino'],
            update: ['molino', 'espresso', 'espumador'].map((id) => ({ id, skin: 'facade' as const })),
            add: {
              nodes: [skinned('facade', node('cocina', 'Cocina', 'KitchenFacade', [3, 2.5], { type: 'pass' }, { codeRef: 'KitchenFacade#latte' }))],
              wires: [wire('mostrador', 'cocina'), wire('app', 'cocina'), wire('cocina', 'molino')],
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
            removeWires: ['app->molinoApp'],
            add: {
              nodes: [skinned('adapter', node('adaptador', 'Adaptador', 'DeliveryRequestAdapter', [3, 4], { type: 'transform', setShape: 'square' }))],
              wires: [wire('app', 'adaptador'), wire('adaptador', 'molinoApp')],
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
            removeWires: ['molinoApp->espressoApp'],
            add: {
              nodes: [skinned('proxy', node('proxyMaquina', 'Proxy', 'EspressoMachineProxy', [7.5, 5.5]))],
              wires: [wire('molinoApp', 'proxyMaquina'), wire('proxyMaquina', 'espressoApp')],
            },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Latte', [], {}, 'mostrador'), pulse(0, 'Latte (app)', ['app'], {}, 'app'), pulse(60, 'Latte', [], {}, 'mostrador'), pulse(60, 'Latte (app)', ['app'], {}, 'app')],
    },
  ],
  changeTickets: [
    {
      id: 'precalentar',
      text: 'La máquina nueva necesita precalentarse antes de extraer.',
      scenario: 'main',
      without: {
        removeWires: ['molino->espresso', 'molinoApp->espressoApp'],
        add: {
          nodes: [preheat('precal', [7.5, -0.5]), preheat('precalApp', [7.5, 5.5])],
          wires: [...chain('molino', 'precal', 'espresso'), ...chain('molinoApp', 'precalApp', 'espressoApp')],
        },
      },
      with: {
        removeWires: ['molino->espresso'],
        add: { nodes: [skinned('facade', preheat('precal', [7.5, -0.5]))], wires: chain('molino', 'precal', 'espresso') },
      },
      code: { without: 'base_precalentar', with: 'facade_precalentar' },
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
      base_precalentar: code(basePrecalentar),
      facade: code(facade),
      facade_precalentar: code(facadePrecalentar),
      adapter: code(base + adapter),
      proxy: code(base + proxy),
    },
  },
})
