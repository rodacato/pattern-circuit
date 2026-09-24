import { FAMILY_NAMES, PATTERNS, type Evaluation, type LevelDef, type MetricName, type PatternFamily } from '../../engine'
import { msg, N, type Message } from '../../i18n'
import { pendingSockets, type FlowState } from '../flow/levelFlow'

// Pistas de menos a más: una pregunta guía, la familia del patrón, un descarte y, al final, la respuesta.
// Todo sale de los datos del nivel; las definiciones de familia GoF son las del libro (Gamma et al., 1994, cap. 1).

// Preguntas guía por síntoma: orientan la mirada sin nombrar ningún patrón.
// i18n
const QUESTIONS: Partial<Record<MetricName, string>> = {
  dropped: '¿Por qué se pierden pedidos? Busca el caso que no tiene a dónde ir.',
  invalidAtSink: '¿Llegan pedidos equivocados? Mira quién decide qué se crea o cómo se arma.',
  duplicatesAtSink: '¿Algo ocurre más de una vez? Pregúntate si hay que avisar a todos o elegir uno.',
  nodesTouched: '¿El cambio obliga a abrir piezas que ya funcionaban? Busca dónde podría enchufarse lo nuevo sin tocarlas.',
  nodes: '¿Hace falta cada pieza que agregas? Busca el arreglo más chico que funcione.',
  maxLoad: '¿Alguien carga con trabajo de más o espera sin necesidad?',
  cancelled: '¿Se puede detener algo antes de que ocurra?',
  delivered: '¿Por qué no llegan todos los pedidos al cliente? Sigue un pulso con clic.',
}

// i18n
const FAMILY_HINT: Record<PatternFamily, string> = {
  creational: 'los creacionales, que se ocupan de cómo se crean los objetos',
  structural: 'los estructurales, que se ocupan de cómo se componen clases y objetos',
  behavioral: 'los de comportamiento, que reparten responsabilidades y definen cómo interactúan los objetos',
  architecture: 'los de arquitectura, que ordenan componentes enteros y cómo se comunican',
  resilience: 'los de resiliencia, que deciden qué hacer cuando otro servicio falla',
  principle: 'los principios: a veces la mejor pieza es la que no agregas',
}

type HintLevel = Pick<LevelDef, 'sockets' | 'changeTickets'>

export function hintLadder(level: HintLevel, flow: FlowState, result?: Evaluation): Message[] {
  const socket = pendingSockets(level, flow)[0]
  if (!socket) return []
  const answer = socket.inventory.find((p) => socket.options[p]?.outcome === 'solves')
  if (!answer) return []
  // "Entregados" es el síntoma más general: si falla otra métrica, esa orienta mejor.
  const failing = result?.results.filter((r) => !r.pass).map((r) => r.assertion.metric).sort((a, b) => Number(a === 'delivered') - Number(b === 'delivered'))[0]
  const decoy = socket.inventory.find((p) => socket.options[p]?.outcome === 'misfit' && flow.plugs[socket.id]?.pattern !== p)
  const family = PATTERNS[answer].family
  // Con varios sockets, cada pista dice de cuál habla.
  const where = level.sockets.length > 1 ? msg(' (socket "{socket}")', { socket: socket.label }) : ''
  return [
    (failing && QUESTIONS[failing]) ?? N('Corre el circuito y sigue un pulso: ¿dónde se tuerce el recorrido?'),
    msg('El patrón que buscas{where} es de la familia {family}: {detail}.', { where, family: FAMILY_NAMES[family], detail: FAMILY_HINT[family] }),
    ...(decoy ? [msg('Descarta {pattern}{where}: no encaja con este problema.', { pattern: PATTERNS[decoy].name, where })] : []),
    msg('Prueba con {pattern}{where}.', { pattern: PATTERNS[answer].name, where }),
  ]
}
