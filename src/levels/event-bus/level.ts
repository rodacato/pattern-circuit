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
const consumer = (id: string, className: string, y: number) =>
  node(id, className, [9, y], { type: 'sink', message: '' }, { codeRef: `${className}#on_event` })

export default defineLevel({
  id: 'event-bus',
  order: 19,
  chapter: 'architecture',
  targetPattern: 'event-bus',
  circuit: {
    nodes: [
      actor('customers', [0, 1]),
      actor('refundEvents', [0, 4]),
      node('orders', 'Orders', [3, 1], { type: 'broadcast' }, { codeRef: 'Orders#place' }),
      node('returns', 'Returns', [3, 4], { type: 'broadcast' }, { codeRef: 'Returns#process' }),
      consumer('inventory', 'Inventory', 0),
      consumer('billing', 'Billing', 2.5),
      consumer('loyalty', 'Loyalty', 5),
    ],
    wires: [
      wire('customers', 'orders'),
      wire('refundEvents', 'returns'),
      wire('orders', 'inventory'),
      wire('orders', 'billing'),
      wire('orders', 'loyalty'),
      wire('returns', 'inventory'),
    ],
  },
  sockets: [
    {
      id: 'events',
      at: 'orders',
      inventory: ['event-bus', 'observer', 'facade'],
      options: {
        'event-bus': {
          outcome: 'solves',
          code: 'bus',
          patch: {
            removeWires: ['orders->inventory', 'orders->billing', 'orders->loyalty', 'returns->inventory'],
            update: [
              { id: 'orders', behavior: { type: 'pass' }, skin: 'event-bus' },
              { id: 'returns', behavior: { type: 'pass' }, skin: 'event-bus' },
            ],
            add: {
              nodes: [skinned('event-bus', node('bus', 'EventBus', [6, 2.5], { type: 'broadcast' }, { codeRef: 'EventBus#publish' }))],
              wires: [abstract('orders', 'bus'), abstract('returns', 'bus'), abstract('bus', 'inventory'), abstract('bus', 'billing'), abstract('bus', 'loyalty')],
            },
          },
        },
        observer: {
          outcome: 'partial',
          code: 'observer',
          patch: {
            removeWires: ['orders->inventory', 'orders->billing', 'orders->loyalty', 'returns->inventory'],
            update: [
              { id: 'orders', skin: 'observer' },
              { id: 'returns', skin: 'observer' },
            ],
            add: { wires: [abstract('orders', 'inventory'), abstract('orders', 'billing'), abstract('orders', 'loyalty'), abstract('returns', 'inventory')] },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          patch: { update: [{ id: 'orders', skin: 'facade' }, { id: 'returns', skin: 'facade' }] },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, ['event:order'], {}, 'customers'), pulse(20, ['event:refund'], {}, 'refundEvents'), pulse(50, ['event:order'], {}, 'customers')],
    },
  ],
  changeTickets: [
    {
      id: 'analytics',
      scenario: 'main',
      without: {
        add: { nodes: [consumer('analytics', 'Analytics', 7.5)], wires: [wire('orders', 'analytics'), wire('returns', 'analytics')] },
      },
      with: {
        add: { nodes: [consumer('analytics', 'Analytics', 7.5)], wires: [abstract('bus', 'analytics')] },
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
