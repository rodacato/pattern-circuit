import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseSupervisor from './base_supervisor.rb?raw'
import chain from './chain.rb?raw'
import chainSupervisor from './chain_supervisor.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import strategy from './strategy.rb?raw'

const code = withCommon(common)
const handler = (id: string, label: string, className: string, at: [number, number], amount: string): NodeInput =>
  skinned('chain-of-responsibility', node(id, label, className, at, { type: 'guard', require: { hasTag: `monto:${amount}` }, onFail: 'next' }, { codeRef: `${className}#handle` }))
const next = (from: string, to: string) => ({ ...abstract(from, to), port: 'next' })

const requests = [
  pulse(0, '$50', ['monto:bajo']),
  pulse(40, '$300', ['monto:medio']),
  pulse(80, '$1500', ['monto:alto']),
  pulse(120, '$9000', ['monto:enorme']),
]

export default defineLevel({
  id: 'L12-chain',
  order: 12,
  chapter: 'hora-pico',
  title: 'Reembolsos',
  targetPattern: 'chain-of-responsibility',
  brief: {
    problem: 'El cajero decide con ifs quién aprueba cada reembolso: él, el gerente o el dueño. Nadie previó los montos enormes y esos pedidos se pierden sin respuesta.',
    goal: 'Que cada reembolso lo atienda quien pueda (o se rechace con aviso) y que sumar un aprobador no obligue a tocar al cajero.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('cajero', 'Cajero', 'Cashier', [3, 2], { type: 'branch', cases: { 'monto:bajo': 'ok', 'monto:medio': 'gerente', 'monto:alto': 'dueno' } }, { codeRef: 'Cashier#refund' }),
      node('gerente', 'Gerente', 'Manager', [6, 2], { type: 'pass' }, { codeRef: 'Manager#approve' }),
      node('dueno', 'Dueño', 'Owner', [10, 2], { type: 'pass' }, { codeRef: 'Owner#approve' }),
      node('reembolsar', 'Reembolsar', 'Refunds', [8, 5], { type: 'sink', message: '💸 reembolsado' }, { codeRef: 'Refunds#pay' }),
    ],
    wires: [
      wire('cliente', 'cajero'),
      wire('cajero', 'reembolsar', { port: 'ok' }),
      wire('cajero', 'gerente', { port: 'gerente' }),
      wire('cajero', 'dueno', { port: 'dueno' }),
      wire('gerente', 'reembolsar'),
      wire('dueno', 'reembolsar'),
    ],
  },
  sockets: [
    {
      id: 'aprobacion',
      at: 'cajero',
      label: 'Aprobación',
      inventory: ['chain-of-responsibility', 'strategy', 'observer'],
      options: {
        'chain-of-responsibility': {
          outcome: 'solves',
          code: 'chain',
          note: {
            title: 'Chain of Responsibility: de mano en mano',
            body: 'Cada eslabón revisa la petición: si puede, la atiende; si no, la pasa al siguiente. El cajero ya no conoce a todos los aprobadores, y lo que nadie puede atender llega al final de la cadena y se rechaza con aviso.',
          },
          patch: {
            remove: ['cajero', 'gerente', 'dueno'],
            add: {
              nodes: [
                handler('cajero', 'Cajero', 'Cashier', [3, 2], 'bajo'),
                handler('gerente', 'Gerente', 'Manager', [6, 2], 'medio'),
                handler('dueno', 'Dueño', 'Owner', [10, 2], 'alto'),
                node('noProcede', 'No procede', 'Refunds', [13, 2], { type: 'sink', message: '✋ rechazado con aviso' }, { codeRef: 'Refunds#decline' }),
              ],
              wires: [
                wire('cliente', 'cajero'),
                wire('cajero', 'reembolsar'),
                wire('gerente', 'reembolsar'),
                wire('dueno', 'reembolsar'),
                next('cajero', 'gerente'),
                next('gerente', 'dueno'),
                next('dueno', 'noProcede'),
              ],
            },
          },
        },
        strategy: {
          outcome: 'partial',
          code: 'strategy',
          note: {
            title: 'Strategy funciona si conoces todas las categorías',
            body: 'Elegir el aprobador por categoría reparte bien los casos conocidos, pero exige saber de antemano quién decide cada uno. En la cadena, cada eslabón decide si lo toma, y siempre hay un final que responde.',
          },
          patch: {
            removeWires: ['cajero.ok->reembolsar', 'cajero.gerente->gerente', 'cajero.dueno->dueno'],
            update: [{ id: 'cajero', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: { wires: [abstract('cajero', 'reembolsar', 'monto:bajo'), abstract('cajero', 'gerente', 'monto:medio'), abstract('cajero', 'dueno', 'monto:alto')] },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
          note: {
            title: 'Observer avisa a todos: todos aprueban',
            body: 'Si el cajero difunde la petición a todos los aprobadores, cada uno la aprueba por su lado y el reembolso se paga varias veces.',
          },
          patch: {
            removeWires: ['cajero.ok->reembolsar', 'cajero.gerente->gerente', 'cajero.dueno->dueno'],
            update: [{ id: 'cajero', behavior: { type: 'broadcast' }, skin: 'observer' }],
            add: { wires: [abstract('cajero', 'reembolsar'), abstract('cajero', 'gerente'), abstract('cajero', 'dueno')] },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: requests },
    { id: 'con-supervisor', pulses: [...requests, pulse(160, '$800', ['monto:medio-alto'])] },
  ],
  changeTickets: [
    {
      id: 'supervisor',
      text: 'Nuevo rol: un supervisor aprueba los reembolsos medianos-altos.',
      scenario: 'con-supervisor',
      without: {
        update: [{ id: 'cajero', behavior: { type: 'branch', cases: { 'monto:bajo': 'ok', 'monto:medio': 'gerente', 'monto:medio-alto': 'supervisor', 'monto:alto': 'dueno' } } }],
        add: {
          nodes: [node('supervisor', 'Supervisor', 'Supervisor', [8, 0], { type: 'pass' }, { codeRef: 'Supervisor#approve' })],
          wires: [wire('cajero', 'supervisor', { port: 'supervisor' }), wire('supervisor', 'reembolsar')],
        },
      },
      with: {
        removeWires: ['gerente.next->dueno'],
        add: {
          nodes: [handler('supervisor', 'Supervisor', 'Supervisor', [8, 0], 'medio-alto')],
          wires: [next('gerente', 'supervisor'), next('supervisor', 'dueno'), wire('supervisor', 'reembolsar')],
        },
      },
      code: { without: 'base_supervisor', with: 'chain_supervisor' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 4 },
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'duplicatesAtSink', op: '==', value: 0 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      base_supervisor: code(baseSupervisor),
      chain: code(chain),
      chain_supervisor: code(chainSupervisor),
      strategy: code(strategy),
      observer: code(observer),
    },
  },
})
