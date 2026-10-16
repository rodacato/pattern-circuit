import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseSupervisor from './base_supervisor.rb?raw'
import chain from './chain.rb?raw'
import chainSupervisor from './chain_supervisor.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseSupervisor from './ts/base_supervisor.ts?raw'
import tsChain from './ts/chain.ts?raw'
import tsChainSupervisor from './ts/chain_supervisor.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const handler = (id: string, label: string, className: string, at: [number, number], amount: string): NodeInput =>
  skinned('chain-of-responsibility', node(id, label, className, at, { type: 'guard', require: { hasTag: `amount:${amount}` }, onFail: 'next' }, { codeRef: `${className}#handle` }))
const next = (from: string, to: string) => ({ ...abstract(from, to), port: 'next' })

const requests = [
  pulse(0, '$50', ['amount:low']),
  pulse(40, '$300', ['amount:medium']),
  pulse(80, '$1500', ['amount:high']),
  pulse(120, '$9000', ['amount:huge']),
]

export default defineLevel({
  id: 'chain',
  order: 12,
  chapter: 'rush-hour',
  title: 'Reembolsos',
  targetPattern: 'chain-of-responsibility',
  brief: {
    problem: 'El cajero decide con ifs quién aprueba cada reembolso: él, el gerente o el dueño. Nadie previó los montos enormes y esos pedidos se pierden sin respuesta.',
    goal: 'Que cada reembolso lo atienda quien pueda (o se rechace con aviso) y que sumar un aprobador no obligue a tocar al cajero.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('cashier', 'Cajero', 'Cashier', [3, 2], { type: 'branch', cases: { 'amount:low': 'ok', 'amount:medium': 'manager', 'amount:high': 'owner' } }, { codeRef: 'Cashier#refund' }),
      node('manager', 'Gerente', 'Manager', [6, 2], { type: 'pass' }, { codeRef: 'Manager#approve' }),
      node('owner', 'Dueño', 'Owner', [10, 2], { type: 'pass' }, { codeRef: 'Owner#approve' }),
      node('refund', 'Reembolsar', 'Refunds', [8, 5], { type: 'sink', message: '💸 reembolsado' }, { codeRef: 'Refunds#pay' }),
    ],
    wires: [
      wire('customer', 'cashier'),
      wire('cashier', 'refund', { port: 'ok' }),
      wire('cashier', 'manager', { port: 'manager' }),
      wire('cashier', 'owner', { port: 'owner' }),
      wire('manager', 'refund'),
      wire('owner', 'refund'),
    ],
  },
  sockets: [
    {
      id: 'approval',
      at: 'cashier',
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
            remove: ['cashier', 'manager', 'owner'],
            add: {
              nodes: [
                handler('cashier', 'Cajero', 'Cashier', [3, 2], 'low'),
                handler('manager', 'Gerente', 'Manager', [6, 2], 'medium'),
                handler('owner', 'Dueño', 'Owner', [10, 2], 'high'),
                node('declined', 'No procede', 'Refunds', [13, 2], { type: 'sink', message: '✋ rechazado con aviso' }, { codeRef: 'Refunds#decline' }),
              ],
              wires: [
                wire('customer', 'cashier'),
                wire('cashier', 'refund'),
                wire('manager', 'refund'),
                wire('owner', 'refund'),
                next('cashier', 'manager'),
                next('manager', 'owner'),
                next('owner', 'declined'),
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
            removeWires: ['cashier.ok->refund', 'cashier.manager->manager', 'cashier.owner->owner'],
            update: [{ id: 'cashier', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: { wires: [abstract('cashier', 'refund', 'amount:low'), abstract('cashier', 'manager', 'amount:medium'), abstract('cashier', 'owner', 'amount:high')] },
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
            removeWires: ['cashier.ok->refund', 'cashier.manager->manager', 'cashier.owner->owner'],
            update: [{ id: 'cashier', behavior: { type: 'broadcast' }, skin: 'observer' }],
            add: { wires: [abstract('cashier', 'refund'), abstract('cashier', 'manager'), abstract('cashier', 'owner')] },
          },
        },
      },
    },
  ],
  scenarios: [
    { id: 'main', pulses: requests },
    { id: 'with-supervisor', pulses: [...requests, pulse(160, '$800', ['amount:medium-high'])] },
  ],
  changeTickets: [
    {
      id: 'supervisor',
      text: 'Nuevo rol: un supervisor aprueba los reembolsos medianos-altos.',
      scenario: 'with-supervisor',
      without: {
        update: [{ id: 'cashier', behavior: { type: 'branch', cases: { 'amount:low': 'ok', 'amount:medium': 'manager', 'amount:medium-high': 'supervisor', 'amount:high': 'owner' } } }],
        add: {
          nodes: [node('supervisor', 'Supervisor', 'Supervisor', [8, 0], { type: 'pass' }, { codeRef: 'Supervisor#approve' })],
          wires: [wire('cashier', 'supervisor', { port: 'supervisor' }), wire('supervisor', 'refund')],
        },
      },
      with: {
        removeWires: ['manager.next->owner'],
        add: {
          nodes: [handler('supervisor', 'Supervisor', 'Supervisor', [8, 0], 'medium-high')],
          wires: [next('manager', 'supervisor'), next('supervisor', 'owner'), wire('supervisor', 'refund')],
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
    ts: {
      base: codeTs(tsBase),
      base_supervisor: codeTs(tsBaseSupervisor),
      chain: codeTs(tsChain),
      chain_supervisor: codeTs(tsChainSupervisor),
      strategy: codeTs(tsStrategy),
      observer: codeTs(tsObserver),
    },
  },
})
