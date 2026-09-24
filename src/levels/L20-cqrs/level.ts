import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import cqrs from './cqrs.rb?raw'
import facade from './facade.rb?raw'
import singleton from './singleton.rb?raw'

const code = withCommon(common)
const reads = Array.from({ length: 8 }, (_, i) => pulse(i * 10, 'Ver pedidos', ['lectura'], {}, 'pantallas'))
const writes = [5, 35, 65].map((at, i) => pulse(at, `Pedido nuevo ${i + 1}`, ['escritura'], {}, 'mostrador'))

export default defineLevel({
  id: 'L20-cqrs',
  order: 20,
  chapter: 'arquitectura',
  title: 'Mil pantallas, un mostrador',
  targetPattern: 'cqrs',
  brief: {
    problem: 'Las pantallas de la cafetería preguntan sin parar por los pedidos, y el mostrador registra pedidos nuevos. Todos usan el mismo modelo, que atiende de a uno: las lecturas hacen fila con las escrituras.',
    goal: 'Que leer no bloquee a escribir: que la fila en cualquier nodo no pase de tres.',
  },
  circuit: {
    nodes: [
      actor('pantallas', 'Pantallas', [0, 0]),
      actor('mostrador', 'Mostrador', [0, 4]),
      node('store', 'Modelo de pedidos', 'OrderStore', [5, 2], { type: 'branch', cases: { lectura: 'lectura', escritura: 'escritura' } }, { cost: 16, capacity: 1, codeRef: 'OrderStore#handle' }),
      node('tablero', 'Tablero', 'OrderBoard', [10, 0], { type: 'sink', message: '📺 tablero actualizado' }, { codeRef: 'OrderBoard#show' }),
      node('registrado', 'Registrado', 'Counter', [10, 4], { type: 'sink', message: '✔ registrado' }, { codeRef: 'Counter#saved' }),
    ],
    wires: [wire('pantallas', 'store'), wire('mostrador', 'store'), wire('store', 'tablero', { port: 'lectura' }), wire('store', 'registrado', { port: 'escritura' })],
  },
  sockets: [
    {
      id: 'modelo',
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
                skinned('cqrs', node('comandos', 'Escritura', 'PlaceOrder', [4, 4], { type: 'pass' }, { cost: 16, capacity: 1, codeRef: 'PlaceOrder#call' })),
                skinned('cqrs', node('proyeccion', 'Proyección', 'BoardProjection', [7, 4], { type: 'broadcast' }, { codeRef: 'BoardProjection#on_order_placed' })),
                skinned('cqrs', node('vista', 'Vista de lectura', 'BoardQuery', [4, 0], { type: 'pass' }, { cost: 6, codeRef: 'BoardQuery#call' })),
              ],
              wires: [...chain('pantallas', 'vista', 'tablero'), ...chain('mostrador', 'comandos', 'proyeccion'), wire('proyeccion', 'registrado'), abstract('proyeccion', 'tablero')],
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
            removeWires: ['pantallas->store', 'mostrador->store'],
            add: {
              nodes: [skinned('facade', node('ventanilla', 'Ventanilla', 'OrdersDesk', [2.5, 2], { type: 'pass' }, { codeRef: 'OrdersDesk' }))],
              wires: [wire('pantallas', 'ventanilla'), wire('mostrador', 'ventanilla'), wire('ventanilla', 'store')],
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
  code: { rb: { base: code(base), cqrs: code(cqrs), singleton: code(base + singleton), facade: code(base + facade) } },
})
