import type { PatternId } from '../../engine'
import { chainOfResponsibility, command, observer, state, strategy, templateMethod } from './behavioral'
import { builder, factoryMethod, singleton } from './creational'
import { cqrs, eventBus, portsAndAdapters } from './architecture'
import { circuitBreaker, nullObject, saga } from './resilience'
import { adapter, composite, decorator, facade, proxy } from './structural'
import type { Skin } from './types'

export type { DrawContext, Skin } from './types'
export { stateColor } from './behavioral'

// Cada stage crea sus skins: el estado de animación (qué cartucho brilla, qué prensa baja) no se comparte.
// Record completo: un patrón nuevo sin skin no compila.
export function createSkins(): Record<PatternId, Skin> {
  return {
    'factory-method': factoryMethod(),
    builder: builder(),
    singleton: singleton(),
    adapter: adapter(),
    decorator: decorator(),
    facade: facade(),
    proxy: proxy(),
    composite: composite(),
    strategy: strategy(),
    observer: observer(),
    state: state(),
    command: command(),
    'chain-of-responsibility': chainOfResponsibility(),
    'template-method': templateMethod(),
    'ports-and-adapters': portsAndAdapters(),
    'event-bus': eventBus(),
    cqrs: cqrs(),
    'null-object': nullObject(),
    'circuit-breaker': circuitBreaker(),
    saga: saga(),
  }
}
