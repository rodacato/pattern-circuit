import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import cafeteria from './cafeteria.rb?raw'
import pyCafeteria from './py/cafeteria.py?raw'
import tsCafeteria from './ts/cafeteria.ts?raw'

const impossible = { all: [{ hasTag: 'hot' }, { hasTag: 'ice' }] }
const payment = (id: string, className: string, y: number) =>
  skinned('strategy', node(id, className, [10, y], { type: 'pass' }, { codeRef: `${className}#charge` }))
const order = (at: number, tags: string[], id: number) => pulse(at, ['cmd:order', ...tags], { order: id })

export default defineLevel({
  id: 'full-cafe',
  order: 26,
  chapter: 'final',
  circuit: {
    nodes: [
      actor('customer', [0, 3]),
      skinned('builder', node('size', 'OrderBuilder', [2.5, 3], { type: 'pass' }, { codeRef: 'OrderBuilder#size' })),
      skinned('builder', node('build', 'OrderBuilder', [5, 3], { type: 'guard', require: { not: impossible }, onFail: 'reject' }, { codeRef: 'OrderBuilder#build' })),
      node('notify', 'Counter', [5, 6], { type: 'sink', message: '' }, { codeRef: 'Counter#notify' }),
      skinned('strategy', node('charge', 'Cashier', [7.5, 3], { type: 'slot' }, { codeRef: 'Cashier#charge' })),
      payment('cash', 'CashPayment', 1),
      payment('card', 'CardPayment', 3),
      payment('app', 'AppPayment', 5),
      skinned('command', node('queue', 'CommandQueue', [12.5, 3], { type: 'buffer', cancelTag: 'cmd:cancel', match: 'order' }, { cost: 60, codeRef: 'CommandQueue#push' })),
      skinned('facade', node('kitchen', 'KitchenFacade', [15, 3], { type: 'pass' }, { codeRef: 'KitchenFacade#latte' })),
      skinned('facade', node('espresso', 'EspressoMachine', [17.5, 3], { type: 'transform', addTags: ['prepared'] }, { codeRef: 'EspressoMachine#extract' })),
      skinned('observer', node('ready', 'Order', [20, 3], { type: 'broadcast' }, { codeRef: 'Order#complete!' })),
      skinned('observer', node('display', 'Display', [22.5, 1.5], { type: 'sink', message: '' }, { codeRef: 'Display#update' })),
      skinned('observer', node('loyalty', 'LoyaltyProgram', [22.5, 4.5], { type: 'sink', message: '' }, { codeRef: 'LoyaltyProgram#update' })),
    ],
    wires: [
      ...chain('customer', 'size', 'build', 'charge'),
      wire('build', 'notify', { port: 'reject' }),
      abstract('charge', 'cash', 'cash'),
      abstract('charge', 'card', 'card'),
      abstract('charge', 'app', 'app'),
      wire('cash', 'queue'),
      wire('card', 'queue'),
      wire('app', 'queue'),
      ...chain('queue', 'kitchen', 'espresso', 'ready'),
      abstract('ready', 'display'),
      abstract('ready', 'loyalty'),
    ],
  },
  scenarios: [
    {
      id: 'main',
      pulses: [
        order(0, ['cash'], 1),
        order(40, ['card'], 2),
        pulse(70, ['cmd:cancel', 'card'], { order: 2 }),
        order(100, ['cash', 'hot', 'ice'], 3),
        order(140, ['app'], 4),
      ],
    },
  ],
  checklist: [
    { on: 'play' },
    { on: 'follow-pulse' },
    { on: 'inspect-node' },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 5 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base: cafeteria }, ts: { base: tsCafeteria }, py: { base: pyCafeteria } },
})
