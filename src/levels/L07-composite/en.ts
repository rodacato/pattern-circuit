import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Combos dentro de combos': 'Combos inside combos',
  'El Desayuno trae café, pan y un Mini combo (jugo + fruta). La cocina pregunta "¿es producto o combo?" y solo sabe desarmar un nivel: el mini combo se pierde y la bandeja nunca se completa.':
    'The Breakfast comes with coffee, bread and a Mini combo (juice + fruit). The kitchen asks "is it a product or a combo?" and can only unpack one level: the mini combo gets lost and the tray is never complete.',
  'Que la cocina prepare igual un producto suelto que un combo, tenga los niveles que tenga.':
    'Make the kitchen prepare a single product and a combo the same way, no matter how many levels it has.',
  'Cliente': 'Customer',
  'Cocina': 'Kitchen',
  'Desayuno': 'Breakfast',
  'Café': 'Coffee',
  'Pan': 'Bread',
  'Mini combo': 'Mini combo',
  'Juntar': 'Merge',
  'Servir': 'Serve',
  'Entregar': 'Hand over',
  'Jugo': 'Juice',
  'Fruta': 'Fruit',
  'Envuelto': 'Wrapped',
  'Combos': 'Combos',
  'Composite: la hoja y el grupo se tratan igual': 'Composite: the leaf and the group are treated the same',
  'Producto y Combo responden al mismo mensaje. Un combo reparte el trabajo entre sus partes y junta lo que le devuelven, sin importar si esas partes son productos u otros combos.':
    'Product and Combo answer the same message. A combo splits the work among its parts and merges what they return, whether those parts are products or other combos.',
  'Decorator envuelve, no desarma': 'Decorator wraps, it doesn\'t unpack',
  'Envolver el mini combo le añade algo por fuera, pero la cocina sigue sin saber qué hacer con un combo dentro de otro.':
    'Wrapping the mini combo adds something on the outside, but the kitchen still doesn\'t know what to do with a combo inside another.',
  'Strategy elige cómo, pero no recursa': 'Strategy picks how, but doesn\'t recurse',
  'Una estrategia por tipo de ítem sigue siendo un "si es combo, haz esto". Ninguna estrategia sabe que un combo puede traer otro adentro.':
    'One strategy per item type is still an "if it\'s a combo, do this". No strategy knows a combo can have another one inside.',
  'Café suelto': 'Single coffee',
}

export default en
