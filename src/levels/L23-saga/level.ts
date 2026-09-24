import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import saga from './saga.rb?raw'

const code = withCommon(common)
const avisar = node('avisar', 'Avisar al cliente', 'Counter', [0, 5], { type: 'sink', expects: { hasTag: 'reembolsado' }, message: '💸 reembolsado y avisado' }, { codeRef: 'Counter#notify' })

export default defineLevel({
  id: 'L23-saga',
  order: 23,
  chapter: 'resiliencia',
  title: 'Cobrado y sin avena',
  targetPattern: 'saga',
  brief: {
    problem: 'Tomar un pedido son tres pasos en servicios distintos: cobrar, reservar insumos y preparar. Si falta avena, el cobro ya se hizo: el cliente pagó y se queda sin nada.',
    goal: 'Que si un paso falla, los anteriores se compensen: el cliente recupera su dinero y se entera.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('cobrar', 'Cobrar', 'Payments', [3, 2], { type: 'pass' }, { codeRef: 'Payments.charge' }),
      node('reservar', 'Reservar insumos', 'Inventory', [6.5, 2], { type: 'guard', require: { not: { hasTag: 'sin-stock' } }, onFail: 'drop' }, { codeRef: 'Inventory.reserve' }),
      node('preparar', 'Preparar', 'Barista', [10, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [13, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('cliente', 'cobrar', 'reservar', 'preparar', 'entregar'),
  },
  sockets: [
    {
      id: 'pasos',
      at: 'reservar',
      label: 'Pasos del pedido',
      inventory: ['saga', 'command', 'observer'],
      options: {
        saga: {
          outcome: 'solves',
          code: 'saga',
          note: {
            title: 'Saga: cada paso con su compensación',
            body: 'Sin una transacción que abarque los tres servicios, cada paso trae su acción compensatoria. Si reservar falla, se ejecutan las compensaciones de lo ya hecho en orden inverso: el cobro se corrige con un reembolso.',
          },
          patch: {
            update: [
              { id: 'reservar', behavior: { type: 'guard', require: { not: { hasTag: 'sin-stock' } }, onFail: 'compensar' }, skin: 'saga' },
              { id: 'cobrar', skin: 'saga' },
            ],
            add: {
              nodes: [skinned('saga', node('reembolsar', 'Reembolsar', 'Payments', [3, 5], { type: 'transform', addTags: ['reembolsado'] }, { codeRef: 'Payments.refund' })), avisar],
              wires: [wire('reservar', 'reembolsar', { port: 'compensar' }), wire('reembolsar', 'avisar')],
            },
          },
        },
        command: {
          outcome: 'partial',
          code: 'command',
          note: {
            title: 'Command deshace en memoria; una saga compensa entre servicios',
            body: 'El undo de Command revierte estado local que el propio objeto guardó. Un cobro en el banco no se revierte: se compensa con una acción nueva (un reembolso), y alguien tiene que coordinar qué compensar cuando falla un paso en otro servicio. Command puede ser la pieza de cada paso, pero no orquesta la compensación.',
          },
          patch: { update: [{ id: 'cobrar', skin: 'command', codeRef: 'ChargeCommand' }] },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          note: { title: 'Avisar no es compensar', body: 'Todos se enteran de que el pedido falló, pero nadie devuelve el dinero.' },
          patch: {
            update: [{ id: 'reservar', behavior: { type: 'guard', require: { not: { hasTag: 'sin-stock' } }, onFail: 'avisar' }, skin: 'observer' }],
            add: { nodes: [avisar], wires: [wire('reservar', 'avisar', { port: 'avisar' })] },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [pulse(0, 'Latte'), pulse(40, 'Mocha'), pulse(80, 'Latte de avena', ['sin-stock']), pulse(120, 'Té')],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 4 },
    { metric: 'dropped', op: '==', value: 0, label: 'clientes que pagaron y se quedaron sin nada' },
    { metric: 'invalidAtSink', op: '==', value: 0, label: 'avisos sin reembolso' },
  ],
  code: { rb: { base: code(base), saga: code(saga), command: code(base + command), observer: code(base + observer) } },
})
