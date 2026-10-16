import { defineLevel } from '../../engine'
import base from './base.rb?raw'
import repaired from './repaired.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsRepaired from './ts/repaired.ts?raw'

export default defineLevel({
  id: 'tutorial',
  order: 0,
  chapter: 'opening',
  title: 'Abre la cafetería',
  brief: {
    problem: 'Los pedidos llegan al barista… y ahí se quedan. Falta una conexión.',
    goal: 'Conecta Preparar con Entregar para que los tres pedidos lleguen al cliente.',
  },
  circuit: {
    nodes: [
      { id: 'customer', label: 'Cliente', kind: 'actor', at: [0, 2], behavior: { type: 'source' } },
      { id: 'take', label: 'Tomar pedido', className: 'OrderTaker', at: [3, 2], behavior: { type: 'pass' }, codeRef: 'OrderTaker#take' },
      { id: 'charge', label: 'Cobrar', className: 'Cashier', at: [6, 2], behavior: { type: 'pass' }, codeRef: 'Cashier#charge' },
      { id: 'prepare', label: 'Preparar', className: 'Barista', at: [9, 2], behavior: { type: 'pass' }, codeRef: 'Barista#prepare' },
      { id: 'handOver', label: 'Entregar', className: 'Counter', at: [12, 2], behavior: { type: 'sink' }, codeRef: 'Counter#hand_over' },
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
      prompt: 'Arrastra desde el puerto de salida de Preparar hasta Entregar.',
      patch: { add: { wires: [{ from: 'prepare', to: 'handOver' }] } },
      code: 'repaired',
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        { at: 0, from: 'customer', tags: ['espresso'], label: 'Espresso' },
        { at: 50, from: 'customer', tags: ['latte'], label: 'Latte' },
        { at: 100, from: 'customer', tags: ['espresso'], label: 'Espresso' },
      ],
    },
  ],
  checklist: [
    { text: 'Dale play y mira viajar los pedidos', on: 'play' },
    { text: 'Pausa y avanza un paso a la vez', on: 'step' },
    { text: 'Haz clic en un nodo para ver su código', on: 'inspect-node' },
    { text: 'Arrastra el cable que falta hasta Entregar', on: 'repair' },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base, repaired }, ts: { base: tsBase, repaired: tsRepaired } },
})
