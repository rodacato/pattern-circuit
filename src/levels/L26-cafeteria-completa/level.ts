import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import cafeteria from './cafeteria.rb?raw'
import tsCafeteria from './ts/cafeteria.ts?raw'

const impossible = { all: [{ hasTag: 'caliente' }, { hasTag: 'hielo' }] }
const payment = (id: string, label: string, className: string, y: number) =>
  skinned('strategy', node(id, label, className, [10, y], { type: 'pass' }, { codeRef: `${className}#charge` }))
const order = (at: number, label: string, tags: string[], id: number) => pulse(at, label, ['cmd:pedir', ...tags], { order: id })

export default defineLevel({
  id: 'L26-cafeteria-completa',
  order: 26,
  chapter: 'final',
  title: 'La cafetería completa',
  brief: {
    problem: 'Todo lo que armaste, funcionando junto: el pedido se arma por pasos, se cobra con el cartucho que toca, espera en cola por si lo cancelan, pasa por la cocina y avisa a todos.',
    goal: 'Recorre la cafetería: sigue un pulso de punta a punta y abre el código de cada patrón.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 3]),
      skinned('builder', node('tamano', 'Tamaño', 'OrderBuilder', [2.5, 3], { type: 'pass' }, { codeRef: 'OrderBuilder#size' })),
      skinned('builder', node('build', 'build()', 'OrderBuilder', [5, 3], { type: 'guard', require: { not: impossible }, onFail: 'rechazo' }, { codeRef: 'OrderBuilder#build' })),
      node('avisar', 'Avisar al cliente', 'Counter', [5, 6], { type: 'sink', message: '✋ rechazado antes de cobrar' }, { codeRef: 'Counter#notify' }),
      skinned('strategy', node('cobrar', 'Cobrar', 'Cashier', [7.5, 3], { type: 'slot' }, { codeRef: 'Cashier#charge' })),
      payment('efectivo', 'Efectivo', 'CashPayment', 1),
      payment('tarjeta', 'Tarjeta + Adapter', 'CardPayment', 3),
      payment('app', 'App', 'AppPayment', 5),
      skinned('command', node('cola', 'Cola', 'CommandQueue', [12.5, 3], { type: 'buffer', cancelTag: 'cmd:cancelar', match: 'order' }, { cost: 60, codeRef: 'CommandQueue#push' })),
      skinned('facade', node('cocina', 'Cocina', 'KitchenFacade', [15, 3], { type: 'pass' }, { codeRef: 'KitchenFacade#latte' })),
      skinned('facade', node('espresso', 'Máquina', 'EspressoMachine', [17.5, 3], { type: 'transform', addTags: ['preparado'] }, { codeRef: 'EspressoMachine#extract' })),
      skinned('observer', node('listo', 'Pedido listo', 'Order', [20, 3], { type: 'broadcast' }, { codeRef: 'Order#complete!' })),
      skinned('observer', node('pantalla', 'Pantalla', 'Display', [22.5, 1.5], { type: 'sink', message: '🔔 pantalla' }, { codeRef: 'Display#update' })),
      skinned('observer', node('lealtad', 'Lealtad', 'LoyaltyProgram', [22.5, 4.5], { type: 'sink', message: '🔔 lealtad' }, { codeRef: 'LoyaltyProgram#update' })),
    ],
    wires: [
      ...chain('cliente', 'tamano', 'build', 'cobrar'),
      wire('build', 'avisar', { port: 'rechazo' }),
      abstract('cobrar', 'efectivo', 'cash'),
      abstract('cobrar', 'tarjeta', 'card'),
      abstract('cobrar', 'app', 'app'),
      wire('efectivo', 'cola'),
      wire('tarjeta', 'cola'),
      wire('app', 'cola'),
      ...chain('cola', 'cocina', 'espresso', 'listo'),
      abstract('listo', 'pantalla'),
      abstract('listo', 'lealtad'),
    ],
  },
  scenarios: [
    {
      id: 'main',
      pulses: [
        order(0, 'Latte · efectivo', ['cash'], 1),
        order(40, 'Mocha · tarjeta', ['card'], 2),
        pulse(70, 'Cancelar mocha', ['cmd:cancelar', 'card'], { order: 2 }),
        order(100, 'Americano caliente con hielo', ['cash', 'caliente', 'hielo'], 3),
        order(140, 'Té · app', ['app'], 4),
      ],
    },
  ],
  checklist: [
    { text: 'Dale play y mira todo el recorrido', on: 'play' },
    { text: 'Haz clic en un pulso para seguirlo de punta a punta', on: 'follow-pulse' },
    { text: 'Abre el código de un nodo que te interese', on: 'inspect-node' },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 5 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base: cafeteria }, ts: { base: tsCafeteria } },
})
