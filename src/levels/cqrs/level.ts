import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import cqrs from './cqrs.rb?raw'
import facade from './facade.rb?raw'
import singleton from './singleton.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsCqrs from './ts/cqrs.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const reads = Array.from({ length: 8 }, (_, i) => pulse(i * 10, 'Ver pedidos', ['read'], {}, 'displays'))
const writes = [5, 35, 65].map((at, i) => pulse(at, `Pedido nuevo ${i + 1}`, ['write'], {}, 'counter'))

export default defineLevel({
  id: 'cqrs',
  order: 20,
  chapter: 'architecture',
  title: 'Mil pantallas, un mostrador',
  targetPattern: 'cqrs',
  brief: {
    problem: 'Las pantallas de la cafetería preguntan sin parar por los pedidos, y el mostrador registra pedidos nuevos. Todos usan el mismo modelo, que atiende de a uno: las lecturas hacen fila con las escrituras.',
    goal: 'Que leer no bloquee a escribir: que la fila en cualquier nodo no pase de tres.',
  },
  circuit: {
    nodes: [
      actor('displays', 'Pantallas', [0, 0]),
      actor('counter', 'Mostrador', [0, 4]),
      node('store', 'Modelo de pedidos', 'OrderStore', [5, 2], { type: 'branch', cases: { read: 'read', write: 'write' } }, { cost: 16, capacity: 1, codeRef: 'OrderStore#handle' }),
      node('board', 'Tablero', 'OrderBoard', [10, 0], { type: 'sink', message: '📺 tablero actualizado' }, { codeRef: 'OrderBoard#show' }),
      node('registered', 'Registrado', 'Counter', [10, 4], { type: 'sink', message: '✔ registrado' }, { codeRef: 'Counter#saved' }),
    ],
    wires: [wire('displays', 'store'), wire('counter', 'store'), wire('store', 'board', { port: 'read' }), wire('store', 'registered', { port: 'write' })],
  },
  sockets: [
    {
      id: 'model',
      at: 'store',
      label: 'Modelo',
      inventory: ['cqrs', 'singleton', 'facade'],
      options: {
        cqrs: {
          outcome: 'solves',
          code: 'cqrs',
          note: {
            title: 'CQRS: escribir y leer por caminos separados',
            body: 'El lado de escritura valida y guarda, de a uno. Cada cambio actualiza una proyección: una vista ya lista para leer. Las pantallas consultan esa vista, que responde rápido y sin fila. A cambio, la vista puede ir un instante detrás de la escritura.',
          },
          patch: {
            remove: ['store'],
            add: {
              nodes: [
                skinned('cqrs', node('commands', 'Escritura', 'PlaceOrder', [4, 4], { type: 'pass' }, { cost: 16, capacity: 1, codeRef: 'PlaceOrder#call' })),
                skinned('cqrs', node('projection', 'Proyección', 'BoardProjection', [7, 4], { type: 'broadcast' }, { codeRef: 'BoardProjection#on_order_placed' })),
                skinned('cqrs', node('view', 'Vista de lectura', 'BoardQuery', [4, 0], { type: 'pass' }, { cost: 6, codeRef: 'BoardQuery#call' })),
              ],
              wires: [...chain('displays', 'view', 'board'), ...chain('counter', 'commands', 'projection'), wire('projection', 'registered'), abstract('projection', 'board')],
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          note: { title: 'Una instancia, la misma fila', body: 'Compartir una única instancia del modelo no cambia que lecturas y escrituras esperen en la misma fila.' },
          patch: { update: [{ id: 'store', skin: 'singleton' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          note: { title: 'Facade no separa caminos', body: 'Una ventanilla única delante del modelo es otra puerta hacia la misma fila.' },
          patch: {
            removeWires: ['displays->store', 'counter->store'],
            add: {
              nodes: [skinned('facade', node('desk', 'Ventanilla', 'OrdersDesk', [2.5, 2], { type: 'pass' }, { codeRef: 'OrdersDesk' }))],
              wires: [wire('displays', 'desk'), wire('counter', 'desk'), wire('desk', 'store')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [...reads, ...writes] }],
  winWhen: [
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'maxLoad', op: '<=', value: 3 },
  ],
  code: { rb: { base: code(base), cqrs: code(cqrs), singleton: code(base + singleton), facade: code(base + facade) }, ts: { base: codeTs(tsBase), cqrs: codeTs(tsCqrs), singleton: codeTs(tsBase + tsSingleton), facade: codeTs(tsBase + tsFacade) } },
})
