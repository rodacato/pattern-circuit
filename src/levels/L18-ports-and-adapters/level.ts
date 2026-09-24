import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import ports from './ports.rb?raw'
import singleton from './singleton.rb?raw'

const code = withCommon(common)
const external = (id: string, label: string, className: string, at: [number, number], codeRef: string): NodeInput =>
  node(id, label, className, at, { type: 'guard', require: { hasTag: 'env:prod' }, onFail: 'drop' }, { kind: 'external', codeRef })
const adapterNode = (id: string, label: string, className: string, at: [number, number], extra: Partial<NodeInput> = {}) =>
  skinned('ports-and-adapters', node(id, label, className, at, { type: 'pass' }, { codeRef: className, ...extra }))

export default defineLevel({
  id: 'L18-ports-and-adapters',
  order: 18,
  chapter: 'arquitectura',
  title: 'El núcleo y el mundo',
  targetPattern: 'ports-and-adapters',
  brief: {
    problem: 'Queremos correr pedidos de prueba en cada cambio. Pero el núcleo del negocio abre la base de datos real y cobra con Stripe directamente: en el entorno de pruebas no hay base de datos y todo explota.',
    goal: 'Que el mismo núcleo funcione en pruebas y en producción cambiando solo lo que se enchufa alrededor.',
  },
  circuit: {
    nodes: [
      actor('web', 'App web', [0, 2]),
      node('nucleo', 'Núcleo: pedidos', 'OrderService', [3, 2], { type: 'pass' }, { codeRef: 'OrderService#place' }),
      external('postgres', 'Postgres', 'PG', [7, 2], 'Postgres'),
      external('stripe', 'Stripe', 'Stripe', [11, 2], 'Stripe'),
      node('confirmar', 'Confirmar', 'Receipt', [16, 2], { type: 'sink' }, { codeRef: 'Receipt#confirm' }),
    ],
    wires: chain('web', 'nucleo', 'postgres', 'stripe', 'confirmar'),
  },
  sockets: [
    {
      id: 'dependencias',
      at: 'nucleo',
      label: 'Dependencias',
      inventory: ['ports-and-adapters', 'adapter', 'facade', 'singleton'],
      options: {
        'ports-and-adapters': {
          outcome: 'solves',
          code: 'ports',
          note: {
            title: 'Ports & Adapters: el núcleo define los enchufes',
            body: 'El núcleo declara puertos (guardar pedidos, cobrar) y no sabe quién los implementa. En pruebas se enchufan adaptadores en memoria; en producción, Postgres y Stripe. Es la respuesta al Singleton del nivel 4: nada global, todo se inyecta.',
          },
          patch: {
            remove: ['postgres', 'stripe'],
            update: [{ id: 'nucleo', skin: 'ports-and-adapters' }],
            add: {
              nodes: [
                skinned('ports-and-adapters', node('repoPort', 'Puerto: pedidos', 'Port::Repository', [6, 2], { type: 'slot' }, { codeRef: 'Port::Repository' })),
                adapterNode('memRepo', 'En memoria', 'InMemoryOrders', [8.5, 0.5]),
                adapterNode('pgRepo', 'Postgres', 'PostgresOrders', [8.5, 3.5], { kind: 'external' }),
                skinned('ports-and-adapters', node('payPort', 'Puerto: pagos', 'Port::Payments', [11, 2], { type: 'slot' }, { codeRef: 'Port::Payments' })),
                adapterNode('fakePay', 'Pagos falsos', 'FakePayments', [13.5, 0.5]),
                adapterNode('stripePay', 'Stripe', 'StripePayments', [13.5, 3.5], { kind: 'external' }),
              ],
              wires: [
                abstract('nucleo', 'repoPort'),
                abstract('repoPort', 'memRepo', 'env:test'),
                abstract('repoPort', 'pgRepo', 'env:prod'),
                wire('memRepo', 'payPort'),
                wire('pgRepo', 'payPort'),
                abstract('payPort', 'fakePay', 'env:test'),
                abstract('payPort', 'stripePay', 'env:prod'),
                wire('fakePay', 'confirmar'),
                wire('stripePay', 'confirmar'),
              ],
            },
          },
        },
        adapter: {
          outcome: 'partial',
          code: 'adapter',
          note: {
            title: 'Un adaptador es una pieza, no la arquitectura',
            body: 'Adaptar Stripe es un buen paso, pero el núcleo sigue atado a Postgres. Ports & Adapters aplica la misma idea a todas las dependencias, y hace que sea el núcleo quien define las interfaces.',
          },
          patch: {
            removeWires: ['postgres->stripe'],
            add: {
              nodes: [skinned('adapter', node('adaptadorStripe', 'Adaptador', 'StripeAdapter', [9, 0.5], { type: 'pass' }, { codeRef: 'StripeAdapter' }))],
              wires: chain('postgres', 'adaptadorStripe', 'stripe'),
            },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          note: { title: 'Facade esconde, no desacopla', body: 'Agrupar la infraestructura detrás de una fachada no cambia que el núcleo termine llamando a la base de datos real.' },
          patch: {
            removeWires: ['nucleo->postgres'],
            add: {
              nodes: [skinned('facade', node('infra', 'Infraestructura', 'Infrastructure', [5, 0.5], { type: 'pass' }, { codeRef: 'Infrastructure' }))],
              wires: chain('nucleo', 'infra', 'postgres'),
            },
          },
        },
        singleton: {
          outcome: 'misfit',
          code: 'singleton',
          note: {
            title: 'El precio del Singleton',
            body: 'Una conexión global única es justo lo que impide cambiarla por otra en las pruebas. Lo que en el nivel 4 resolvía, aquí estorba.',
          },
          patch: { update: [{ id: 'postgres', skin: 'singleton', codeRef: 'Database.instance' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Prueba 1', ['env:test'], {}, 'web'), pulse(40, 'Prueba 2', ['env:test'], {}, 'web'), pulse(80, 'Pedido real', ['env:prod'], {}, 'web')],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base: code(base), ports: code(ports), adapter: code(base + adapter), facade: code(base + facade), singleton: code(base + singleton) } },
})
