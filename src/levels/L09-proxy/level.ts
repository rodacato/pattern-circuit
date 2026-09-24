import { defineLevel } from '../../engine'
import { actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import proxy from './proxy.rb?raw'
import singleton from './singleton.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsProxy from './ts/proxy.ts?raw'
import tsSingleton from './ts/singleton.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const items = ['café', 'leche', 'café', 'café', 'leche', 'café']

export default defineLevel({
  id: 'L09-proxy',
  order: 9,
  chapter: 'barra',
  title: 'El almacén está lejos',
  targetPattern: 'proxy',
  brief: {
    problem: 'Cada pedido pregunta al almacén remoto si hay stock. El almacén tarda y atiende de a uno: se forma una fila enorme, aunque casi siempre preguntamos lo mismo.',
    goal: 'Que la fila frente al almacén no pase de dos consultas sin cambiar a quien pregunta.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('almacen', 'Almacén remoto', 'RemoteInventory', [8, 0], { type: 'pass' }, { kind: 'external', cost: 90, capacity: 1, codeRef: 'RemoteInventory#in_stock?' }),
      node('preparar', 'Preparar', 'Barista', [11, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [14, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [wire('cliente', 'tomar'), wire('tomar', 'almacen'), wire('almacen', 'preparar'), wire('preparar', 'entregar')],
  },
  sockets: [
    {
      id: 'inventario',
      at: 'tomar',
      label: 'Inventario',
      inventory: ['proxy', 'singleton', 'facade'],
      options: {
        proxy: {
          outcome: 'solves',
          code: 'proxy',
          note: {
            title: 'Proxy: un sustituto que controla el acceso',
            body: 'El proxy tiene la misma interfaz que el almacén, así que quien pregunta no nota el cambio. Solo viaja al almacén cuando no conoce la respuesta; lo demás rebota en el proxy sin hacer fila. El precio: la respuesta guardada puede quedar vieja, así que un proxy real le pone caducidad.',
          },
          patch: {
            removeWires: ['tomar->almacen'],
            add: {
              nodes: [skinned('proxy', node('proxy', 'Proxy', 'CachedInventory', [5.5, 2], { type: 'cache', key: 'item' }, { codeRef: 'CachedInventory#in_stock?' }))],
              wires: [wire('tomar', 'proxy'), wire('proxy', 'almacen', { port: 'miss' }), wire('proxy', 'preparar', { port: 'hit' })],
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          note: {
            title: 'Singleton no ahorra viajes',
            body: 'Tener una sola instancia del cliente remoto no cambia cuántas veces se consulta el almacén. La fila sigue igual de larga.',
          },
          patch: { update: [{ id: 'almacen', skin: 'singleton', codeRef: 'RemoteInventory.instance' }] },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          note: {
            title: 'Facade simplifica, no evita el trabajo',
            body: 'Poner una ventanilla única delante del almacén no reduce las consultas: cada pedido sigue llegando hasta el almacén.',
          },
          patch: {
            removeWires: ['tomar->almacen'],
            add: {
              nodes: [skinned('facade', node('ventanilla', 'Ventanilla', 'StockDesk', [5.5, 2], { type: 'pass' }, { codeRef: 'StockDesk#in_stock?' }))],
              wires: [wire('tomar', 'ventanilla'), wire('ventanilla', 'almacen')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: items.map((item, i) => pulse(i * 20, item, [item === 'café' ? 'cafe' : 'leche'], { item })) }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 6 },
    { metric: 'maxLoad', op: '<=', value: 2 },
  ],
  code: {
    rb: { base: code(base), proxy: code(proxy), singleton: code(singleton), facade: code(facade) },
    ts: { base: codeTs(tsBase), proxy: codeTs(tsProxy), singleton: codeTs(tsSingleton), facade: codeTs(tsFacade) },
  },
})
