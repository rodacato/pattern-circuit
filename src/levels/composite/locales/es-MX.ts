import type en from './en'

const texts: Record<keyof typeof en, string> = {
  title: 'Combos dentro de combos',
  'brief.problem': 'El Desayuno trae café, pan y un Mini combo (jugo + fruta). La cocina pregunta "¿es producto o combo?" y solo sabe desarmar un nivel: el mini combo se pierde y la bandeja nunca se completa.',
  'brief.goal': 'Que la cocina prepare igual un producto suelto que un combo, tenga los niveles que tenga.',
  'node.unpack': 'Desayuno',
  'node.coffee': 'Café',
  'node.bread': 'Pan',
  'node.mini': 'Mini combo',
  'node.tray': 'Juntar',
  'socket.combo': 'Combos',
  'option.combo.composite.title': 'Composite: la hoja y el grupo se tratan igual',
  'option.combo.composite.body': 'Producto y Combo responden al mismo mensaje. Un combo reparte el trabajo entre sus partes y junta lo que le devuelven, sin importar si esas partes son productos u otros combos.',
  'option.combo.decorator.title': 'Decorator envuelve, no desarma',
  'option.combo.decorator.body': 'Envolver el mini combo le añade algo por fuera, pero la cocina sigue sin saber qué hacer con un combo dentro de otro.',
  'option.combo.strategy.title': 'Strategy elige cómo, pero no da un contrato común',
  'option.combo.strategy.body': 'Una estrategia por tipo de ítem sigue siendo un "si es combo, haz esto". Ninguna les da a productos y combos la misma interfaz, así que un combo dentro de otro queda sin atender.',
  'scenario.main.0': 'Café suelto',
  'scenario.main.1': 'Desayuno',
  'node.juice': 'Jugo',
  'node.fruit': 'Fruta',
  'node.joinMini': 'Juntar',
  'node.wrapped': 'Envuelto',
}

export default texts
