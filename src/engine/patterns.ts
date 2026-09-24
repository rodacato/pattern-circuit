import type { PatternId } from './schema'

export type PatternFamily = 'creational' | 'structural' | 'behavioral' | 'architecture' | 'resilience'

export type PatternInfo = { name: string; family: PatternFamily; gist: string }

// Catálogo de patrones: nombre visible, familia y la idea en una frase.
export const PATTERNS: Record<PatternId, PatternInfo> = {
  'factory-method': { name: 'Factory Method', family: 'creational', gist: 'Una subclase decide qué objeto crear.' },
  builder: { name: 'Builder', family: 'creational', gist: 'Arma un objeto complejo paso a paso; build() entrega el resultado (y puede validarlo).' },
  singleton: { name: 'Singleton', family: 'creational', gist: 'Una sola instancia compartida por todos.' },
  adapter: { name: 'Adapter', family: 'structural', gist: 'Convierte una interfaz en la que el cliente espera.' },
  decorator: { name: 'Decorator', family: 'structural', gist: 'Envuelve un objeto para sumarle comportamiento.' },
  proxy: { name: 'Proxy', family: 'structural', gist: 'Un sustituto que controla el acceso al objeto real.' },
  composite: { name: 'Composite', family: 'structural', gist: 'Trata igual a una hoja y a un grupo de hojas.' },
  facade: { name: 'Facade', family: 'structural', gist: 'Una puerta simple a un subsistema complicado.' },
  strategy: { name: 'Strategy', family: 'behavioral', gist: 'Alternativas intercambiables detrás de una misma interfaz.' },
  observer: { name: 'Observer', family: 'behavioral', gist: 'Avisa a todos los suscriptores cuando algo pasa.' },
  state: { name: 'State', family: 'behavioral', gist: 'El comportamiento cambia según el estado interno.' },
  command: { name: 'Command', family: 'behavioral', gist: 'Una petición convertida en objeto: se encola, se cancela antes de correr o se revierte con undo.' },
  'chain-of-responsibility': { name: 'Chain of Responsibility', family: 'behavioral', gist: 'La petición pasa de mano en mano hasta que alguien la atiende.' },
  'template-method': { name: 'Template Method', family: 'behavioral', gist: 'Un esqueleto fijo con pasos que las subclases rellenan.' },
  'ports-and-adapters': { name: 'Ports & Adapters', family: 'architecture', gist: 'El núcleo no conoce el mundo exterior, solo sus puertos.' },
  'event-bus': { name: 'Event Bus', family: 'architecture', gist: 'Los componentes se hablan por eventos, sin conocerse.' },
  cqrs: { name: 'CQRS', family: 'architecture', gist: 'Escribir y leer por caminos separados.' },
  'null-object': { name: 'Null Object', family: 'behavioral', gist: 'Un objeto que no hace nada en lugar de nil: sin ifs de "¿existe?".' },
  'circuit-breaker': { name: 'Circuit Breaker', family: 'resilience', gist: 'Tras varios fallos seguidos deja de llamar al servicio caído y falla rápido (o usa un respaldo).' },
  saga: { name: 'Saga', family: 'resilience', gist: 'Pasos con acciones que los compensan si algo falla más adelante.' },
}

export const FAMILY_NAMES: Record<PatternFamily, string> = {
  creational: 'creacional',
  structural: 'estructural',
  behavioral: 'comportamiento',
  architecture: 'arquitectura',
  resilience: 'resiliencia',
}
