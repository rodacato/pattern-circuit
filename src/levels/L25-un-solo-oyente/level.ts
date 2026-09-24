import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import command from './command.rb?raw'
import common from './common.rb?raw'
import eventBus from './event_bus.rb?raw'
import simple from './simple.rb?raw'

const code = withCommon(common)
const PIECES = 5 // avisar a la cocina no necesita piezas nuevas: basta un cable

export default defineLevel({
  id: 'L25-un-solo-oyente',
  order: 25,
  chapter: 'criterio',
  title: 'Un solo interesado',
  targetPattern: 'keep-simple',
  brief: {
    problem: 'Cuando se cobra un pedido, la cocina tiene que enterarse para empezar a prepararlo. Hoy nadie le avisa y los pedidos se pierden. Solo la cocina necesita saberlo, y no hay otros interesados a la vista.',
    goal: 'Que la cocina reciba cada pedido y que el flujo se siga leyendo de corrido.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('cobrar', 'Cobrar', 'Cashier', [6, 2], { type: 'pass' }, { codeRef: 'Cashier#charge' }),
      node('cocina', 'Cocina', 'Kitchen', [10, 2], { type: 'pass' }, { codeRef: 'Kitchen#start' }),
      node('entregar', 'Entregar', 'Counter', [13, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: [...chain('cliente', 'tomar', 'cobrar'), wire('cocina', 'entregar')],
  },
  sockets: [
    {
      id: 'aviso',
      at: 'cobrar',
      label: 'Aviso a la cocina',
      inventory: ['event-bus', 'command', 'keep-simple'],
      options: {
        'keep-simple': {
          outcome: 'solves',
          code: 'simple',
          note: {
            title: 'Una llamada directa se lee de corrido',
            body: 'Con un solo interesado, Cashier llama a la cocina y el flujo queda escrito en el código de principio a fin. Un bus o una lista de suscriptores tendrán sentido cuando aparezcan más interesados.',
          },
          patch: { update: [{ id: 'cobrar', skin: 'keep-simple' }], add: { wires: [wire('cobrar', 'cocina', { dep: 'concrete' })] } },
        },
        'event-bus': {
          outcome: 'misfit',
          code: 'event_bus',
          note: {
            title: 'Un bus para un solo suscriptor',
            body: 'Funciona, pero el flujo ya no está escrito en ningún lado: para saber qué pasa tras cobrar hay que buscar quién se suscribió. Fowler advierte que con eventos el flujo cuesta ver; con un solo oyente, no hay nada que desacoplar.',
          },
          patch: {
            add: {
              nodes: [skinned('event-bus', node('bus', 'Bus de eventos', 'EventBus', [8, 0], { type: 'broadcast' }, { codeRef: 'EventBus#publish' }))],
              wires: [wire('cobrar', 'bus', { dep: 'concrete' }), abstract('bus', 'cocina')],
            },
          },
        },
        command: {
          outcome: 'misfit',
          code: 'command',
          note: {
            title: 'Un comando que nadie encola ni deshace',
            body: 'Command convierte una petición en objeto para poder encolarla, deshacerla o registrarla. Aquí no se hace nada de eso: es un objeto más entre Cashier y la cocina.',
          },
          patch: {
            add: {
              nodes: [skinned('command', node('orden', 'Orden a cocina', 'StartOrder', [8, 0], { type: 'pass' }, { codeRef: 'StartOrder#call' }))],
              wires: [wire('cobrar', 'orden', { dep: 'concrete' }), wire('orden', 'cocina', { dep: 'concrete' })],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Latte'), pulse(40, 'Mocha'), pulse(80, 'Té')] }],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'nodes', op: '<=', value: PIECES },
  ],
  code: { rb: { base: code(base), simple: code(simple), event_bus: code(eventBus), command: code(command) } },
})
