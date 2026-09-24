import { defineLevel } from '../../engine'
import { abstract, actor, chain, node, pulse, skinned, wire, withCommon } from '../kit'
import base from './base.rb?raw'
import baseCocina from './base_cocina.rb?raw'
import chainCode from './chain.rb?raw'
import common from './common.rb?raw'
import observer from './observer.rb?raw'
import observerCocina from './observer_cocina.rb?raw'
import strategy from './strategy.rb?raw'
import tsBase from './ts/base.ts?raw'
import tsBaseCocina from './ts/base_cocina.ts?raw'
import tsChain from './ts/chain.ts?raw'
import tsCommon from './ts/common.ts?raw'
import tsObserver from './ts/observer.ts?raw'
import tsObserverCocina from './ts/observer_cocina.ts?raw'
import tsStrategy from './ts/strategy.ts?raw'

const code = withCommon(common)
const codeTs = withCommon(tsCommon)
const subscriber = (id: string, label: string, className: string, y: number) =>
  node(id, label, className, [10, y], { type: 'sink', message: `🔔 ${label} avisada` }, { codeRef: `${className}#update` })

export default defineLevel({
  id: 'L10-observer',
  order: 10,
  chapter: 'hora-pico',
  title: '¡Pedido listo!',
  targetPattern: 'observer',
  brief: {
    problem: 'Cuando un pedido está listo hay que avisar a la pantalla, a la app del cliente y al programa de lealtad. El pedido llama a cada uno por nombre… y a Lealtad nunca la llama.',
    goal: 'Que todos los interesados se enteren y que sumar uno nuevo no obligue a tocar el pedido.',
  },
  circuit: {
    nodes: [
      actor('cliente', 'Cliente', [0, 2]),
      node('barra', 'Preparar', 'Barista', [3, 2], { type: 'pass' }, { codeRef: 'Barista#prepare' }),
      node('listo', 'Pedido listo', 'Order', [6, 2], { type: 'broadcast' }, { codeRef: 'Order#complete!' }),
      subscriber('pantalla', 'Pantalla', 'Display', 0),
      subscriber('push', 'App del cliente', 'PushNotifier', 2),
      subscriber('lealtad', 'Lealtad', 'LoyaltyProgram', 4),
    ],
    wires: [...chain('cliente', 'barra', 'listo'), wire('listo', 'pantalla'), wire('listo', 'push')],
  },
  sockets: [
    {
      id: 'avisos',
      at: 'listo',
      label: 'Avisos',
      inventory: ['observer', 'strategy', 'chain-of-responsibility'],
      options: {
        observer: {
          outcome: 'solves',
          code: 'observer',
          note: {
            title: 'Observer: avisar a todos los suscriptores',
            body: 'El pedido emite un aviso y cada interesado se suscribe por su cuenta. El pedido ya no conoce a nadie por nombre: sumar un suscriptor es registrarlo, sin tocar al pedido.',
          },
          patch: {
            removeWires: ['listo->pantalla', 'listo->push'],
            update: [{ id: 'listo', skin: 'observer' }, ...['pantalla', 'push', 'lealtad'].map((id) => ({ id, skin: 'observer' as const }))],
            add: { wires: [abstract('listo', 'pantalla'), abstract('listo', 'push'), abstract('listo', 'lealtad')] },
          },
        },
        strategy: {
          outcome: 'misfit',
          code: 'strategy',
          note: {
            title: 'Strategy elige uno; Observer avisa a todos',
            body: 'Con una estrategia de aviso el pedido elige un canal: solo la pantalla se entera. Aquí no había que elegir, había que difundir.',
          },
          patch: {
            removeWires: ['listo->pantalla', 'listo->push'],
            update: [{ id: 'listo', behavior: { type: 'slot' }, skin: 'strategy' }],
            add: { wires: [abstract('listo', 'pantalla', 'pantalla'), abstract('listo', 'push', 'push'), abstract('listo', 'lealtad', 'lealtad')] },
          },
        },
        'chain-of-responsibility': {
          outcome: 'misfit',
          code: 'chain',
          note: {
            title: 'En una cadena, alguien se queda con el mensaje',
            body: 'Chain of Responsibility pasa la petición hasta que un eslabón la atiende, y ahí termina. La pantalla atendió el aviso y los demás nunca lo vieron.',
          },
          patch: {
            removeWires: ['listo->push'],
            update: [{ id: 'listo', behavior: { type: 'pass' }, skin: 'chain-of-responsibility' }],
          },
        },
      },
    },
  ],
  scenarios: [{ id: 'main', pulses: [pulse(0, 'Latte', ['pantalla']), pulse(40, 'Mocha', ['pantalla']), pulse(80, 'Té', ['pantalla'])] }],
  changeTickets: [
    {
      id: 'cocina',
      text: 'La cocina también quiere enterarse, para reponer insumos.',
      scenario: 'main',
      without: { add: { nodes: [subscriber('cocina', 'Cocina', 'Kitchen', 6)], wires: [wire('listo', 'cocina')] } },
      with: { add: { nodes: [skinned('observer', subscriber('cocina', 'Cocina', 'Kitchen', 6))], wires: [abstract('listo', 'cocina')] } },
      code: { without: 'base_cocina', with: 'observer_cocina' },
    },
  ],
  winWhen: [
    { metric: 'delivered', op: '>=', value: 9 },
    { metric: 'nodesTouched', op: '==', value: 0 },
  ],
  code: {
    rb: {
      base: code(base),
      base_cocina: code(baseCocina),
      observer: code(observer),
      observer_cocina: code(observerCocina),
      strategy: code(strategy),
      chain: code(chainCode),
    },
    ts: {
      base: codeTs(tsBase),
      base_cocina: codeTs(tsBaseCocina),
      observer: codeTs(tsObserver),
      observer_cocina: codeTs(tsObserverCocina),
      strategy: codeTs(tsStrategy),
      chain: codeTs(tsChain),
    },
  },
})
