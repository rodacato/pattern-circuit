import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire } from '../kit'
import avisosBase from '../L10-observer/base.rb?raw'
import avisosCommon from '../L10-observer/common.rb?raw'
import avisosObserver from '../L10-observer/observer.rb?raw'
import estadosBase from '../L11-state/base.rb?raw'
import estadosCommon from '../L11-state/common.rb?raw'
import { permissive, strict } from '../L11-state/level'
import eventosCommand from './events_command.rb?raw'
import estadosState from '../L11-state/state.rb?raw'
import eventosBase from '../L13-command/base.rb?raw'
import tsAvisosBase from '../L10-observer/ts/base.ts?raw'
import tsAvisosCommon from '../L10-observer/ts/common.ts?raw'
import tsAvisosObserver from '../L10-observer/ts/observer.ts?raw'
import tsEstadosBase from '../L11-state/ts/base.ts?raw'
import tsEstadosCommon from '../L11-state/ts/common.ts?raw'
import tsEstadosState from '../L11-state/ts/state.ts?raw'
import tsEventosBase from '../L13-command/ts/base.ts?raw'
import tsEventosCommand from './ts/events_command.ts?raw'

const notFuera = { not: { hasTag: 'fuera-de-orden' } }
const event = (at: number, name: string, cmd: number, label = name) => pulse(at, label, ['cmd:evento', name], { cmd }, 'eventos')
const reskin = (id: string, skin: 'chain-of-responsibility' | 'proxy' | 'strategy' | 'template-method' | 'facade' | 'singleton') => ({ update: [{ id, skin }] })

export default defineLevel({
  id: 'L17-pedidos-en-vivo',
  order: 17,
  chapter: 'todo-junto',
  title: 'Pedidos en vivo',
  brief: {
    problem: 'Un pedido recibe eventos en vivo. Un "entregar" enviado por error no se puede deshacer, el pedido acepta eventos que no tienen sentido, y cuando cambia de estado solo la pantalla se entera.',
    goal: 'Deshacer a tiempo lo enviado por error, rechazar lo que no aplica y avisar a todos los interesados.',
  },
  circuit: {
    nodes: [
      actor('eventos', 'Eventos', [0, 2]),
      node('mostrador', 'Mostrador', 'FrontDesk', [3, 2], { type: 'branch', cases: { 'cmd:evento': 'out', 'cmd:deshacer': 'deshacer' } }, { codeRef: 'FrontDesk#submit' }),
      node('deshacer', 'Deshacer', 'Undo', [5, 4.5], { type: 'branch', cases: {} }, { codeRef: 'Undo#call' }),
      node('pedido', 'Pedido', 'Order', [7, 2], { type: 'machine', initial: 'pendiente', states: permissive }, { codeRef: 'Order#handle' }),
      node('listo', 'Avisar cambio', 'Order', [10, 2], { type: 'broadcast' }, { codeRef: 'Order#complete!' }),
      node('pantalla', 'Pantalla', 'Display', [13, 0], { type: 'sink', expects: notFuera, message: '🔔 pantalla' }, { codeRef: 'Display#update' }),
      node('lealtad', 'Lealtad', 'LoyaltyProgram', [13, 4], { type: 'sink', expects: notFuera, message: '🔔 lealtad' }, { codeRef: 'LoyaltyProgram#update' }),
    ],
    wires: [wire('eventos', 'mostrador'), wire('mostrador', 'pedido'), wire('mostrador', 'deshacer', { port: 'deshacer' }), ...chain('pedido', 'listo'), wire('listo', 'pantalla')],
  },
  sockets: [
    {
      id: 'eventos',
      at: 'mostrador',
      label: 'Eventos',
      code: 'eventos_base',
      inventory: ['command', 'chain-of-responsibility', 'proxy'],
      options: {
        command: {
          outcome: 'solves',
          code: 'eventos_command',
          note: { title: 'Command: eventos que se pueden retirar', body: 'Cada evento es una tarjeta en cola. El "entregar" enviado por error se retira antes de que llegue al pedido.' },
          patch: {
            remove: ['deshacer'],
            removeWires: ['mostrador->pedido'],
            update: [{ id: 'mostrador', behavior: { type: 'transform', setShape: 'square' }, skin: 'command' }],
            add: {
              nodes: [skinned('command', node('cola', 'Cola', 'CommandQueue', [5, 2], { type: 'buffer', cancelTag: 'cmd:deshacer', match: 'cmd' }, { cost: 50, codeRef: 'CommandQueue#push' }))],
              wires: chain('mostrador', 'cola', 'pedido'),
            },
          },
        },
        'chain-of-responsibility': {
          outcome: 'misfit',
          code: 'eventos_base',
          note: { title: 'Una cadena no deshace', body: 'Pasar la cancelación de mano en mano no sirve si el evento ya se ejecutó: nadie puede atenderla.' },
          patch: reskin('deshacer', 'chain-of-responsibility'),
        },
        proxy: {
          outcome: 'misfit',
          code: 'eventos_base',
          note: { title: 'Un proxy no vuelve en el tiempo', body: 'Un intermediario delante del pedido no guarda los eventos como objetos que se puedan retirar.' },
          patch: reskin('deshacer', 'proxy'),
        },
      },
    },
    {
      id: 'estados',
      at: 'pedido',
      label: 'Estados',
      code: 'estados_base',
      inventory: ['state', 'strategy', 'template-method'],
      options: {
        state: {
          outcome: 'solves',
          code: 'estados_state',
          note: { title: 'State: cada estado sabe qué acepta', body: 'Cancelar algo ya entregado se rechaza en el estado "entregado", sin ifs repartidos.' },
          patch: {
            update: [{ id: 'pedido', behavior: { type: 'machine', initial: 'pendiente', states: strict, else: 'rechazo' }, skin: 'state' }],
            add: {
              nodes: [node('rechazo', 'Rechazar evento', 'History', [9, 5], { type: 'sink', message: '✋ evento rechazado' }, { codeRef: 'History#reject' })],
              wires: [wire('pedido', 'rechazo', { port: 'rechazo' })],
            },
          },
        },
        strategy: { outcome: 'misfit', code: 'estados_base', note: { title: 'Strategy la elige quien llama; en State decide el estado actual', body: 'Una estrategia por evento aplica su cambio sin saber en qué estado está el pedido. En State decide el estado actual, y normalmente él mismo indica el siguiente.' }, patch: reskin('pedido', 'strategy') },
        'template-method': {
          outcome: 'misfit',
          code: 'estados_base',
          note: { title: 'Un esqueleto fijo no valida transiciones', body: 'Template Method fija el orden de unos pasos; aquí el problema es qué eventos tienen sentido según el estado.' },
          patch: reskin('pedido', 'template-method'),
        },
      },
    },
    {
      id: 'avisos',
      at: 'listo',
      label: 'Avisos',
      code: 'avisos_base',
      inventory: ['observer', 'facade', 'singleton'],
      options: {
        observer: {
          outcome: 'solves',
          code: 'avisos_observer',
          note: { title: 'Observer: cada cambio llega a todos', body: 'Pantalla y Lealtad se suscriben al pedido. Los tres patrones conviven: Command decide qué llega, State qué se acepta, Observer quién se entera.' },
          patch: {
            removeWires: ['listo->pantalla'],
            update: [{ id: 'listo', skin: 'observer' }, { id: 'pantalla', skin: 'observer' }, { id: 'lealtad', skin: 'observer' }],
            add: { wires: [abstract('listo', 'pantalla'), abstract('listo', 'lealtad')] },
          },
        },
        facade: { outcome: 'misfit', code: 'avisos_base', note: { title: 'Facade no difunde', body: 'Una puerta simple para avisar sigue llamando a quien conoce: Lealtad sigue sin enterarse.' }, patch: reskin('listo', 'facade') },
        singleton: { outcome: 'misfit', code: 'avisos_base', note: { title: 'Singleton no suma interesados', body: 'Tener un único notificador compartido no cambia a quién le avisa.' }, patch: reskin('listo', 'singleton') },
      },
    },
  ],
  scenarios: [
    {
      id: 'main',
      pulses: [
        event(0, 'pagar', 1),
        event(20, 'entregar', 2, 'entregar (por error)'),
        pulse(35, 'deshacer entregar', ['cmd:deshacer'], { cmd: 2 }, 'eventos'),
        event(60, 'preparar', 4),
        event(100, 'entregar', 5),
        event(140, 'cancelar', 6, 'cancelar (ya entregado)'),
      ],
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '==', value: 7 },
    { metric: 'cancelled', op: '==', value: 1 },
    { metric: 'invalidAtSink', op: '==', value: 0 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: `${estadosCommon}\n${avisosCommon}`,
      eventos_base: eventosBase,
      eventos_command: eventosCommand,
      estados_base: estadosBase,
      estados_state: estadosState,
      avisos_base: avisosBase,
      avisos_observer: avisosObserver,
    },
    ts: {
      base: `${tsEstadosCommon}\n${tsAvisosCommon}`,
      eventos_base: tsEventosBase,
      eventos_command: tsEventosCommand,
      estados_base: tsEstadosBase,
      estados_state: tsEstadosState,
      avisos_base: tsAvisosBase,
      avisos_observer: tsAvisosObserver,
    },
  },
})
