import { defineLevel, type NodeInput } from '../../engine'
import { actor, chain, node, pulse, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import nullObject from './null_object.rb?raw'
import proxy from './proxy.rb?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsNullObject from './ts/null_object.ts?raw'
import tsProxy from './ts/proxy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const usesCard = (id: string, label: string, className: string, codeRef: string, x: number): NodeInput =>
  node(id, label, className, [x, 2], { type: 'guard', require: { not: { hasTag: 'tarjeta:nil' } }, onFail: 'drop' }, { codeRef })

const customers = [
  pulse(0, 'Ana (con tarjeta)', ['tarjeta:ok']),
  pulse(35, 'Beto (sin tarjeta)', ['tarjeta:nil']),
  pulse(70, 'Carla (con tarjeta)', ['tarjeta:ok']),
  pulse(105, 'Dani (sin tarjeta)', ['tarjeta:nil']),
]

export default defineLevel({
  id: 'L21-null-object',
  order: 21,
  chapter: 'resiliencia',
  title: 'El cliente sin tarjeta',
  targetPattern: 'null-object',
  brief: {
    problem: 'Buscar la tarjeta de lealtad devuelve nil cuando el cliente no tiene una. Lealtad, Descuentos y el Recibo la usan sin preguntar, y el pedido explota con NoMethodError.',
    goal: 'Que los clientes sin tarjeta pasen por todo el circuito sin llenar de "if card.nil?" cada lugar que la usa.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('buscar', 'Buscar tarjeta', 'LoyaltyCards', [3, 2], { type: 'pass' }, { codeRef: 'LoyaltyCards#find' }),
      usesCard('lealtad', 'Lealtad', 'Loyalty', 'Loyalty#reward', 6),
      usesCard('descuento', 'Descuento', 'Discounts', 'Discounts#apply', 9),
      usesCard('recibo', 'Recibo', 'Receipt', 'Receipt#print', 12),
      node('entregar', 'Entregar', 'Counter', [15, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('cliente', 'buscar', 'lealtad', 'descuento', 'recibo', 'entregar'),
  },
  sockets: [
    {
      id: 'tarjeta',
      at: 'buscar',
      label: 'Tarjeta',
      inventory: ['null-object', 'decorator', 'proxy', 'adapter'],
      options: {
        'null-object': {
          outcome: 'solves',
          code: 'null_object',
          note: {
            title: 'Null Object: un objeto que no hace nada',
            body: 'En lugar de nil, buscar devuelve una NullCard que responde a todo lo que responde una tarjeta, sin efecto: cero puntos, cero descuento. Los que la usan no cambian ni preguntan nada.',
          },
          patch: {
            update: [{ id: 'buscar', behavior: { type: 'transform', when: { hasTag: 'tarjeta:nil' }, removeTags: ['tarjeta:nil'], addTags: ['tarjeta:nula'] }, skin: 'null-object' }],
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          note: { title: 'Envolver nil sigue siendo nil', body: 'Un decorador delega en lo que envuelve. Si envuelve nil, la primera llamada explota igual.' },
          patch: { update: [{ id: 'buscar', skin: 'decorator' }] },
        },
        proxy: {
          outcome: 'misfit',
          code: 'proxy',
          note: { title: 'Un proxy necesita un objeto real detrás', body: 'El sustituto intenta cargar la tarjeta real al usarla, pero no existe: el problema solo se posterga.' },
          patch: { update: [{ id: 'buscar', skin: 'proxy' }] },
        },
        adapter: {
          outcome: 'misfit',
          code: 'adapter',
          note: { title: 'No hay nada que adaptar', body: 'Un adaptador traduce una interfaz existente. Sin tarjeta, no hay interfaz que traducir.' },
          patch: { update: [{ id: 'buscar', skin: 'adapter' }] },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: customers }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'dropped', op: '==', value: 0, label: 'pedidos que explotaron con NoMethodError' },
  ],
  code: { rb: { base: code(base), null_object: code(nullObject), decorator: code(base + decorator), proxy: code(base + proxy), adapter: code(base + adapter) }, ts: { base: codeTs(tsBase), null_object: codeTs(tsNullObject), decorator: codeTs(tsBase + tsDecorator), proxy: codeTs(tsBase + tsProxy), adapter: codeTs(tsBase + tsAdapter) } },
})
