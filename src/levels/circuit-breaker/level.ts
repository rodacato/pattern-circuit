import { defineLevel } from '../../engine'
import { actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import breaker from './breaker.rb?raw'
import chainCode from './chain.rb?raw'
import common from './common.rb?raw'
import proxy from './proxy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBreaker from './ts/breaker.ts?raw'
import tsChain from './ts/chain.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsProxy from './ts/proxy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const orders = Array.from({ length: 8 }, (_, i) => pulse(i * 90))
const offline = node('offline', 'OfflinePayments', [8, 4.5], { type: 'pass' }, { cost: 6, codeRef: 'OfflinePayments#charge' })
const timeoutMark = (id: string, codeRef: string) =>
  node(id, 'Timeout::Error', [6.5, 0], { type: 'transform', addTags: ['failure', 'timeout'] }, { cost: 4, codeRef })

export default defineLevel({
  id: 'circuit-breaker',
  order: 22,
  chapter: 'resilience',
  targetPattern: 'circuit-breaker',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('charge', 'Cashier', [2.5, 2], { type: 'pass' }, { cost: 4, codeRef: 'Cashier#charge' }),
      node('gateway', 'PaymentGateway', [9, 2], { type: 'guard', require: { hasTag: 'provider-up' }, onFail: 'drop' }, {
        kind: 'external',
        cost: 40,
        codeRef: 'PaymentGateway#charge',
      }),
      node('prepare', 'Barista', [12, 2], { type: 'pass' }, { cost: 6, codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [15, 2], { type: 'sink', expects: { not: { hasTag: 'timeout' } } }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'charge', 'gateway', 'prepare', 'handOver'),
  },
  sockets: [
    {
      id: 'provider',
      at: 'charge',
      inventory: ['circuit-breaker', 'chain-of-responsibility', 'proxy'],
      options: {
        'circuit-breaker': {
          outcome: 'solves',
          code: 'breaker',
          patch: {
            removeWires: ['charge->gateway'],
            update: [{ id: 'gateway', behavior: { type: 'guard', require: { hasTag: 'provider-up' }, onFail: 'failure' } }],
            add: {
              nodes: [
                skinned('circuit-breaker', node('breaker', 'CircuitBreaker', [5, 2], { type: 'breaker', threshold: 2, failTag: 'failure' }, { cost: 4, codeRef: 'CircuitBreaker#charge' })),
                timeoutMark('markTimeout', 'Timeout::Error'),
                offline,
              ],
              wires: [
                wire('charge', 'breaker'),
                wire('breaker', 'gateway', { port: 'call' }),
                wire('gateway', 'markTimeout', { port: 'failure' }),
                wire('markTimeout', 'breaker'),
                wire('breaker', 'offline', { port: 'fallback' }),
                wire('offline', 'prepare'),
              ],
            },
          },
        },
        'chain-of-responsibility': {
          outcome: 'partial',
          code: 'chain',
          patch: {
            update: [{ id: 'gateway', behavior: { type: 'guard', require: { hasTag: 'provider-up' }, onFail: 'failure' }, skin: 'chain-of-responsibility' }],
            add: {
              nodes: [timeoutMark('markTimeout', 'FallbackChain#charge'), offline],
              wires: [wire('gateway', 'markTimeout', { port: 'failure' }), wire('markTimeout', 'offline'), wire('offline', 'prepare')],
            },
          },
        },
        proxy: {
          outcome: 'misfit',
          code: 'proxy',
          patch: { update: [{ id: 'gateway', skin: 'proxy' }] },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: orders }],
  winWhen: [
    { metric: 'dropped', op: '==', value: 0 },
    { metric: 'invalidAtSink', op: '<=', value: 3, label: '' },
  ],
  code: { rb: { base: code(base), breaker: code(breaker), chain: code(chainCode), proxy: code(base + proxy) }, ts: { base: codeTs(tsBase), breaker: codeTs(tsBreaker), chain: codeTs(tsChain), proxy: codeTs(tsBase + tsProxy) } },
})
