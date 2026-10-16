import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import facade from './facade.rb?raw'
import pyAdapter from './py/adapter.py?raw'
import pyBase from './py/base.py?raw'
import pyCommon from './py/common.py?raw'
import pyDecorator from './py/decorator.py?raw'
import pyFacade from './py/facade.py?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsFacade from './ts/facade.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const codePy = withCommon(pyCommon)

export default defineLevel({
  id: 'adapter',
  order: 5,
  chapter: 'bar',
  targetPattern: 'adapter',
  circuit: {
    nodes: [
      actor('customer', [0, 2]),
      node('take', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('charge', 'Cashier', [6, 2], { type: 'transform', setShape: 'square' }, { codeRef: 'Cashier#charge' }),
      node('terminal', 'PagoFacil::SDK', [11, 2], { type: 'guard', require: { shape: 'diamond' }, onFail: 'drop' }, {
        kind: 'external',
        codeRef: 'PagoFacil::SDK#charge_in_cents',
      }),
      node('prepare', 'Barista', [14, 2], { type: 'transform', setShape: 'circle' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Counter', [17, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'take', 'charge', 'terminal', 'prepare', 'handOver'),
  },
  sockets: [
    {
      id: 'gateway',
      at: 'charge',
      inventory: ['adapter', 'decorator', 'facade'],
      options: {
        adapter: {
          outcome: 'solves',
          code: 'adapter',
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('adapter', node('adapter', 'PagoFacilAdapter', [8.5, 2], { type: 'transform', setShape: 'diamond' }, { codeRef: 'PagoFacilAdapter#charge' }))],
              wires: [abstract('charge', 'adapter'), wire('adapter', 'terminal')],
            },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('decorator', node('logger', 'LoggedGateway', [8.5, 2], { type: 'transform', addTags: ['logged'] }))],
              wires: [wire('charge', 'logger'), wire('logger', 'terminal')],
            },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('facade', node('payments', 'Payments', [8.5, 2], { type: 'pass' }, { codeRef: 'Payments#charge' }))],
              wires: [wire('charge', 'payments'), wire('payments', 'terminal')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0), pulse(45), pulse(90)] }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: { base: code(base), adapter: code(adapter), decorator: code(decorator), facade: code(facade) },
    ts: { base: codeTs(tsBase), adapter: codeTs(tsAdapter), decorator: codeTs(tsDecorator), facade: codeTs(tsFacade) },
    py: { base: codePy(pyBase), adapter: codePy(pyAdapter), decorator: codePy(pyDecorator), facade: codePy(pyFacade) },
  },
})
