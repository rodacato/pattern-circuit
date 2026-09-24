import { defineLevel } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import strategy from './strategy.rb?raw'

const code = withCommon(common)

export default defineLevel({
  id: 'L13-command',
  order: 13,
  chapter: 'hora-pico',
  title: 'Me equivoqué de pedido',
  targetPattern: 'command',
  brief: {
    problem: 'Un cliente pide un latte y a los pocos segundos lo cancela. Pero el mostrador ejecuta cada pedido en el acto: cuando llega la cancelación, el latte ya se está preparando.',
    goal: 'Que un pedido cancelado a tiempo no se prepare, sin perder ningún otro pedido.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('mostrador', 'Mostrador', 'FrontDesk', [3, 2], { type: 'branch', cases: { 'cmd:pedir': 'out', 'cmd:cancelar': 'deshacer' } }, { codeRef: 'FrontDesk#submit' }),
      node('deshacer', 'Deshacer', 'Undo', [6, 4.5], { type: 'branch', cases: {} }, { codeRef: 'Undo#call' }),
      node('barista', 'Barista', 'Barista', [9, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Pickup', [12, 2], { type: 'sink' }, { codeRef: 'Pickup#hand_over' }),
    ],
    wires: [wire('cliente', 'mostrador'), wire('mostrador', 'barista'), wire('mostrador', 'deshacer', { port: 'deshacer' }), wire('barista', 'entregar')],
  },
  sockets: [
    {
      id: 'pedidos',
      at: 'mostrador',
      label: 'Pedidos',
      inventory: ['command', 'strategy', 'observer'],
      options: {
        command: {
          outcome: 'solves',
          code: 'command',
          note: {
            title: 'Command: la petición convertida en objeto',
            body: 'Cada pedido se vuelve una tarjeta que se encola y se ejecuta cuando el barista se libera. Mientras espera, se puede cancelar: la cancelación saca la tarjeta de la cola antes de que corra. (Un Command también puede revertir lo ya ejecutado con un undo que guarde el estado previo.)',
          },
          patch: {
            remove: ['deshacer'],
            removeWires: ['mostrador->barista'],
            update: [{ id: 'mostrador', behavior: { type: 'transform', setShape: 'square' }, skin: 'command' }],
            add: {
              nodes: [
                skinned(
                  'command',
                  node('cola', 'Cola', 'CommandQueue', [6, 2], { type: 'buffer', cancelTag: 'cmd:cancelar', match: 'order' }, { cost: 70, codeRef: 'CommandQueue#push' }),
                ),
              ],
              wires: [wire('mostrador', 'cola'), wire('cola', 'barista')],
            },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy no puede volver en el tiempo',
            body: 'Cambiar cómo se cancela no sirve si la acción ya se ejecutó. Para cancelarla a tiempo, la petición tiene que existir como objeto antes de ejecutarse.',
          },
          patch: { update: [{ id: 'deshacer', behavior: { type: 'slot' }, skin: 'strategy', codeRef: 'CancelStrategy' }] },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          note: {
            title: 'Observer difunde, no deshace',
            body: 'Avisar de la cancelación a todos hace que el barista la reciba… como si fuera un pedido más. Se prepara algo que nadie pidió.',
          },
          patch: {
            update: [{ id: 'deshacer', behavior: { type: 'broadcast' }, skin: 'observer', codeRef: 'CancelBroadcast' }],
            add: { wires: [abstract('deshacer', 'barista')] },
          },
        },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        pulse(0, 'Latte', ['cmd:pedir'], { order: 1 }),
        pulse(15, 'Mocha', ['cmd:pedir'], { order: 2 }),
        pulse(30, 'Cancelar latte', ['cmd:cancelar'], { order: 1 }),
        pulse(45, 'Té', ['cmd:pedir'], { order: 3 }),
      ],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 2 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: { rb: { base: code(base), command: code(command), strategy: code(base + strategy), observer: code(base + observer) } },
})
