import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Abre la cafetería',
  'brief.problem': 'Los pedidos llegan al barista… y ahí se quedan. Falta una conexión.',
  'brief.goal': 'Conecta Preparar con Entregar para que los tres pedidos lleguen al cliente.',
  'checklist.play': 'Dale play y mira viajar los pedidos',
  'checklist.step': 'Pausa y avanza un paso a la vez',
  'checklist.inspect-node': 'Haz clic en un nodo para ver su código',
  'checklist.repair': 'Arrastra el cable que falta hasta Entregar',
  'repair.connect-handover': 'Arrastra desde el puerto de salida de Preparar hasta Entregar.',
  'scenario.main.0': 'Espresso',
  'scenario.main.1': 'Latte',
  'scenario.main.2': 'Espresso',
}

export default texts
