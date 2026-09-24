import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import adapter from './adapter.rb?raw'
import base from './base.rb?raw'
import common from './common.rb?raw'
import decorator from './decorator.rb?raw'
import facade from './facade.rb?raw'

const code = withCommon(common)

export default defineLevel({
  id: 'L05-adapter',
  order: 5,
  chapter: 'barra',
  title: 'La terminal nueva',
  targetPattern: 'adapter',
  brief: {
    problem: 'Contratamos la terminal PagoFácil. Su SDK habla otro idioma: Cobrar envía pagos en su formato (■) y la terminal solo acepta el suyo (◆). Todo rebota.',
    goal: 'Que Cobrar use la terminal nueva sin tocar Cobrar ni el SDK del proveedor.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('tomar', 'Tomar pedido', 'OrderTaker', [3, 2], { type: 'pass' }, { codeRef: 'OrderTaker#take' }),
      node('cobrar', 'Cobrar', 'Cashier', [6, 2], { type: 'transform', setShape: 'square' }, { codeRef: 'Cashier#charge' }),
      node('terminal', 'PagoFácil', 'PagoFacil::SDK', [11, 2], { type: 'guard', require: { shape: 'diamond' }, onFail: 'drop' }, {
        kind: 'external',
        codeRef: 'PagoFacil::SDK#cobrar_en_centavos',
      }),
      node('preparar', 'Preparar', 'Barista', [14, 2], { type: 'transform', setShape: 'circle' }, { codeRef: 'Barista#prepare' }),
      node('entregar', 'Entregar', 'Counter', [17, 2], { type: 'sink' }, { codeRef: 'Counter#hand_over' }),
    ],
    wires: chain('cliente', 'tomar', 'cobrar', 'terminal', 'preparar', 'entregar'),
  },
  sockets: [
    {
      id: 'pasarela',
      at: 'cobrar',
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
            removeWires: ['cobrar->terminal'],
            add: {
              nodes: [skinned('adapter', node('adaptador', 'Adaptador', 'PagoFacilAdapter', [8.5, 2], { type: 'transform', setShape: 'diamond' }, { codeRef: 'PagoFacilAdapter#charge' }))],
              wires: [abstract('cobrar', 'adaptador'), wire('adaptador', 'terminal')],
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
            removeWires: ['cobrar->terminal'],
            add: {
              nodes: [skinned('decorator', node('logger', 'Con log', 'LoggedGateway', [8.5, 2], { type: 'transform', addTags: ['logged'] }))],
              wires: [wire('cobrar', 'logger'), wire('logger', 'terminal')],
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
            removeWires: ['cobrar->terminal'],
            add: {
              nodes: [skinned('facade', node('pagos', 'Pagos', 'Payments', [8.5, 2], { type: 'pass' }, { codeRef: 'Payments#charge' }))],
              wires: [wire('cobrar', 'pagos'), wire('pagos', 'terminal')],
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
  code: { rb: { base: code(base), adapter: code(adapter), decorator: code(decorator), facade: code(facade) } },
})
