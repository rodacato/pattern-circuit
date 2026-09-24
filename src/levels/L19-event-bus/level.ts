import { defineLevel } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseAnalytics from './base_analytics.rb?raw'
import bus from './bus.rb?raw'
import busAnalytics from './bus_analytics.rb?raw'
import common from './common.rb?raw'
import facade from './facade.rb?raw'
import observer from './observer.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseAnalytics from './ts/base_analytics.ts?raw'
import tsBus from './ts/bus.ts?raw'
import tsBusAnalytics from './ts/bus_analytics.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsFacade from './ts/facade.ts?raw'
import tsObserver from './ts/observer.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const consumer = (id: string, label: string, className: string, y: number) =>
  node(id, label, className, [9, y], { type: 'sink', message: `📨 ${label}` }, { codeRef: `${className}#on_event` })

export default defineLevel({
  id: 'L19-event-bus',
  order: 19,
  chapter: 'arquitectura',
  title: 'Servicios que se enteran',
  targetPattern: 'event-bus',
  brief: {
    problem: 'Pedidos y Devoluciones avisan a mano a Inventario, Facturación y Lealtad. Cada productor lleva su propia lista, y Devoluciones olvidó a Facturación y a Lealtad: las devoluciones nunca se facturan.',
    goal: 'Que cada evento llegue a todos los servicios interesados, venga de quien venga, y que sumar un servicio no toque a los productores.',
  },
  circuit: {
    nodes: [
      actor('clientes', 'Pedidos', [0, 1]),
      actor('devoluciones', 'Devoluciones', [0, 4]),
      node('orders', 'Servicio de pedidos', 'Orders', [3, 1], { type: 'broadcast' }, { codeRef: 'Orders#place' }),
      node('returns', 'Servicio de devoluciones', 'Returns', [3, 4], { type: 'broadcast' }, { codeRef: 'Returns#process' }),
      consumer('inventario', 'Inventario', 'Inventory', 0),
      consumer('facturacion', 'Facturación', 'Billing', 2.5),
      consumer('lealtad', 'Lealtad', 'Loyalty', 5),
    ],
    wires: [
      wire('clientes', 'orders'),
      wire('devoluciones', 'returns'),
      wire('orders', 'inventario'),
      wire('orders', 'facturacion'),
      wire('orders', 'lealtad'),
      wire('returns', 'inventario'),
    ],
  },
  sockets: [
    {
      id: 'eventos',
      at: 'orders',
      label: 'Eventos',
      inventory: ['event-bus', 'observer', 'facade'],
      options: {
        'event-bus': {
          outcome: 'solves',
          code: 'bus',
          note: {
            title: 'Event Bus: nadie se cablea con nadie',
            body: 'Los productores publican en el bus y los consumidores se suscriben al bus. Ninguno conoce a los demás: un evento llega a todos los interesados venga de donde venga.',
          },
          patch: {
            removeWires: ['orders->inventario', 'orders->facturacion', 'orders->lealtad', 'returns->inventario'],
            update: [
              { id: 'orders', behavior: { type: 'pass' }, skin: 'event-bus' },
              { id: 'returns', behavior: { type: 'pass' }, skin: 'event-bus' },
            ],
            add: {
              nodes: [skinned('event-bus', node('bus', 'Bus de eventos', 'EventBus', [6, 2.5], { type: 'broadcast' }, { codeRef: 'EventBus#publish' }))],
              wires: [abstract('orders', 'bus'), abstract('returns', 'bus'), abstract('bus', 'inventario'), abstract('bus', 'facturacion'), abstract('bus', 'lealtad')],
            },
          },
        },
        observer: {
          outcome: 'partial',
          code: 'observer',
          note: {
            title: 'Observer, un sujeto a la vez',
            body: 'Cada productor como sujeto con suscriptores ya no llama a mano, pero cada uno sigue llevando su propia lista, y la de Devoluciones sigue incompleta. El bus centraliza las suscripciones para todos los productores.',
          },
          patch: {
            removeWires: ['orders->inventario', 'orders->facturacion', 'orders->lealtad', 'returns->inventario'],
            update: [
              { id: 'orders', skin: 'observer' },
              { id: 'returns', skin: 'observer' },
            ],
            add: { wires: [abstract('orders', 'inventario'), abstract('orders', 'facturacion'), abstract('orders', 'lealtad'), abstract('returns', 'inventario')] },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          note: { title: 'Facade agrupa, no distribuye', body: 'Una fachada de servicios simplifica la llamada, pero cada productor sigue decidiendo a quién avisar.' },
          patch: { update: [{ id: 'orders', skin: 'facade' }, { id: 'returns', skin: 'facade' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Pedido', ['evento:pedido'], {}, 'clientes'), pulse(20, 'Devolución', ['evento:devolucion'], {}, 'devoluciones'), pulse(50, 'Pedido', ['evento:pedido'], {}, 'clientes')],
    },
  ],
  changeTickets: [
    {
      id: 'analytics',
      text: 'Nuevo servicio: Analytics quiere enterarse de todo.',
      scenario: 'main',
      without: {
        add: { nodes: [consumer('analytics', 'Analytics', 'Analytics', 7.5)], wires: [wire('orders', 'analytics'), wire('returns', 'analytics')] },
      },
      with: {
        add: { nodes: [consumer('analytics', 'Analytics', 'Analytics', 7.5)], wires: [abstract('bus', 'analytics')] },
      },
      code: { without: 'base_analytics', with: 'bus_analytics' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 9 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: { rb: { base: code(base), base_analytics: code(baseAnalytics), bus: code(bus), bus_analytics: code(busAnalytics), observer: code(observer), facade: code(facade) }, ts: { base: codeTs(tsBase), base_analytics: codeTs(tsBaseAnalytics), bus: codeTs(tsBus), bus_analytics: codeTs(tsBusAnalytics), observer: codeTs(tsObserver), facade: codeTs(tsFacade) } },
})
