import { defineLevel, type NodeInput } from '../../engine'
import { abstract, actor, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseSupervisor from './base_supervisor.rb?raw'
import chain from './chain.rb?raw'
import chainSupervisor from './chain_supervisor.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import strategy from './strategy.rb?raw'
import pyBase from './py/base.py?raw'
import pyBaseSupervisor from './py/base_supervisor.py?raw'
import pyChain from './py/chain.py?raw'
import pyChainSupervisor from './py/chain_supervisor.py?raw'
import pyCommon from './py/common.py?raw'
import pyObserver from './py/observer.py?raw'
import pyStrategy from './py/strategy.py?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseSupervisor from './ts/base_supervisor.ts?raw'
import tsChain from './ts/chain.ts?raw'
import tsChainSupervisor from './ts/chain_supervisor.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)
const handler = (id: string, className: string, at: [number, number], amount: string): NodeInput =>
  skinned('chain-of-responsibility', node(id, className, at, { type: 'guard', require: { hasTag: `amount:${amount}` }, onFail: 'next' }, { codeRef: `${className}#handle` }))
const next = (from: string, to: string) => ({ ...abstract(from, to), port: 'next' })

const requests = [
  pulse(0, ['amount:low']),
  pulse(40, ['amount:medium']),
  pulse(80, ['amount:high']),
  pulse(120, ['amount:huge']),
]

export default defineLevel({
  id: 'chain',
  order: 12,
  chapter: 'rush-hour',
  targetPattern: 'chain-of-responsibility',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('cashier', 'Cashier', [3, 2], { type: 'branch', cases: { 'amount:low': 'ok', 'amount:medium': 'manager', 'amount:high': 'owner' } }, { codeRef: 'Cashier#refund' }),
      node('manager', 'Manager', [6, 2], { type: 'pass' }, { codeRef: 'Manager#approve' }),
      node('owner', 'Owner', [10, 2], { type: 'pass' }, { codeRef: 'Owner#approve' }),
      node('refund', 'Refunds', [8, 5], { type: 'sink', message: '' }, { codeRef: 'Refunds#pay' }),
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
      inventory: ['chain-of-responsibility', 'strategy', 'observer'],
      options: {
        'chain-of-responsibility': {
          outcome: 'solves',
          code: 'chain',
          patch: {
            remove: ['cashier', 'manager', 'owner'],
            add: {
              nodes: [
                handler('cashier', 'Cashier', [3, 2], 'low'),
                handler('manager', 'Manager', [6, 2], 'medium'),
                handler('owner', 'Owner', [10, 2], 'high'),
                node('declined', 'Refunds', [13, 2], { type: 'sink', message: '' }, { codeRef: 'Refunds#decline' }),
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
          patch: {
            removeWires: ['cashier.ok->refund', 'cashier.manager->manager', 'cashier.owner->owner'],
            update: [{ id: 'cashier', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: { wires: [abstract('cashier', 'refund', 'amount:low'), abstract('cashier', 'manager', 'amount:medium'), abstract('cashier', 'owner', 'amount:high')] },
          },
        },
        observer: {
          outcome: 'misfit',
          code: 'observer',
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
    { id: 'with-supervisor', pulses: [...requests, pulse(160, ['amount:medium-high'])] },
  ],
  changeTickets: [
    {
      id: 'supervisor',
      scenario: 'with-supervisor',
      without: {
        update: [{ id: 'cashier', behavior: { type: 'branch', cases: { 'amount:low': 'ok', 'amount:medium': 'manager', 'amount:medium-high': 'supervisor', 'amount:high': 'owner' } } }],
        add: {
          nodes: [node('supervisor', 'Supervisor', [8, 0], { type: 'pass' }, { codeRef: 'Supervisor#approve' })],
          wires: [wire('cashier', 'supervisor', { port: 'supervisor' }), wire('supervisor', 'refund')],
        },
      },
      with: {
        removeWires: ['manager.next->owner'],
        add: {
          nodes: [handler('supervisor', 'Supervisor', [8, 0], 'medium-high')],
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
    py: {
      base: codePy(pyBase),
      base_supervisor: codePy(pyBaseSupervisor),
      chain: codePy(pyChain),
      chain_supervisor: codePy(pyChainSupervisor),
      strategy: codePy(pyStrategy),
      observer: codePy(pyObserver),
    },
  },
})
