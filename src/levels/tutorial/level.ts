import { defineLevel } from '../../engine'
import base from './base.rb?raw'
import repaired from './repaired.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsRepaired from './ts/repaired.ts?raw'

export default defineLevel({
  id: 'tutorial',
  order: 0,
  chapter: 'opening',
  circuit: {
    nodes: [
      { id: 'customer', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      { id: 'charge', className: 'Cashier', at: [6, 2], behavior: { type: 'pass' }, codeRef: 'Cashier#charge' },
      { id: 'prepare', className: 'Barista', at: [9, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'handOver', className: 'Counter', at: [12, 2], behavior: { type: 'sink' }, codeRef: 'Counter#hand_over' },
    ],
    wires: [
      { from: 'customer', to: 'take' },
      { from: 'take', to: 'charge' },
      { from: 'charge', to: 'prepare' },
    ],
  },
  repairs: [
    {
      id: 'connect-handover',
      patch: { add: { wires: [{ from: 'prepare', to: 'handOver' }] } },
      code: 'repaired',
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        { at: 0, from: 'customer', tags: ['espresso'], label: '' },
        { at: 50, from: 'customer', tags: ['latte'], label: '' },
        { at: 100, from: 'customer', tags: ['espresso'], label: '' },
      ],
    },
  ],
  checklist: [{ on: 'play' }, { on: 'step' }, { on: 'inspect-node' }, { on: 'repair' }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base, repaired }, ts: { base: tsBase, repaired: tsRepaired } },
})
