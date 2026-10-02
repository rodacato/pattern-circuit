import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import facade from './facade.rb?raw'
import tsAdapter from './ts/adapter.ts?raw'
import tsBase from './ts/base.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsDecorator from './ts/decorator.ts?raw'
import tsFacade from './ts/facade.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)

export default defineLevel({
  id: 'adapter',
  order: 5,
  chapter: 'bar',
  title: 'La terminal nueva',
  targetPattern: 'adapter',
  brief: {
    problem: 'Contratamos la terminal PagoFácil. Su SDK habla otro idioma: Cobrar envía pagos en su formato (■) y la terminal solo acepta el suyo (◆). Todo rebota.',
    goal: 'Que Cobrar use la terminal nueva sin tocar Cobrar ni el SDK del proveedor.',
  },
  circuit: {
    nodes: [
      actor('customer', 'Cliente', [0, 2]),
      node('take', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('charge', 'Cobrar', 'Cashier', [6, 2], { type: 'transform', setShape: 'square' }, { codeRef: 'Cashier#charge' }),
      node('terminal', 'PagoFácil', 'PagoFacil::SDK', [11, 2], { type: 'guard', require: { shape: 'diamond' }, onFail: 'drop' }, {
        kind: 'external',
        codeRef: 'PagoFacil::SDK#charge_in_cents',
      }),
      node('prepare', 'Preparar', 'Barista', [14, 2], { type: 'transform', setShape: 'circle' }, { codeRef: 'Barista#prepare' }),
      node('handOver', 'Entregar', 'Counter', [17, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('customer', 'take', 'charge', 'terminal', 'prepare', 'handOver'),
  },
  sockets: [
    {
      id: 'gateway',
      at: 'charge',
      label: 'Pasarela de pago',
      inventory: ['adapter', 'decorator', 'facade'],
      options: {
        adapter: {
          outcome: 'solves',
          code: 'adapter',
          note: {
            title: 'Adapter: un traductor entre dos interfaces',
            body: 'Cobrar sigue llamando charge(total) y el SDK sigue sin cambios. El adaptador traduce una llamada a la otra: el pulso entra cuadrado y sale con la forma que la terminal entiende.',
          },
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('adapter', node('adapter', 'Adaptador', 'PagoFacilAdapter', [8.5, 2], { type: 'transform', setShape: 'diamond' }, { codeRef: 'PagoFacilAdapter#charge' }))],
              wires: [abstract('charge', 'adapter'), wire('adapter', 'terminal')],
            },
          },
        },
        decorator: {
          outcome: 'misfit',
          code: 'decorator',
          note: {
            title: 'Decorator añade, pero conserva la interfaz',
            body: 'El envoltorio registra cada cobro y delega exactamente la misma llamada. La forma del pulso no cambia: la terminal lo sigue rechazando.',
          },
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('decorator', node('logger', 'Con log', 'LoggedGateway', [8.5, 2], { type: 'transform', addTags: ['logged'] }))],
              wires: [wire('charge', 'logger'), wire('logger', 'terminal')],
            },
          },
        },
        facade: {
          outcome: 'misfit',
          code: 'facade',
          note: {
            title: 'Facade simplifica un subsistema; Adapter encaja una interfaz',
            body: 'Facade define una interfaz nueva y más simple sobre un subsistema de varias piezas. Aquí no hay subsistema: hay una sola clase cuya interfaz no coincide con la que Cobrar ya espera. Esta fachada reenvía charge tal cual y la terminal lo rechaza; si tradujera a la interfaz existente, sería un Adapter.',
          },
          patch: {
            removeWires: ['charge->terminal'],
            add: {
              nodes: [skinned('facade', node('payments', 'Pagos', 'Payments', [8.5, 2], { type: 'pass' }, { codeRef: 'Payments#charge' }))],
              wires: [wire('charge', 'payments'), wire('payments', 'terminal')],
            },
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Latte'), pulse(45, 'Mocha'), pulse(90, 'Té')] }],
  winWhen: [
    { metric: 'delivered', op: '==', value: 3 },
    { metric: 'dropped', op: '==', value: 0 },
  ],
  code: {
    rb: { base: code(base), adapter: code(adapter), decorator: code(decorator), facade: code(facade) },
    ts: { base: codeTs(tsBase), adapter: codeTs(tsAdapter), decorator: codeTs(tsDecorator), facade: codeTs(tsFacade) },
  },
})
