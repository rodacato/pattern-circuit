import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Recetas copiadas': 'Copied recipes',
  'Café y té siguen la misma receta: hervir agua, preparar, servir, tapar. Pero son dos copias del mismo código, y a la copia del té se le olvidó la tapa.': 'Coffee and tea follow the same recipe: boil water, brew, pour, put the lid on. But they are two copies of the same code, and the tea copy forgot the lid.',
  'Que los pasos comunes vivan en un solo lugar y cada bebida solo defina lo que la hace distinta.': 'Keep the common steps in one place and let each drink define only what makes it different.',
  'Cliente': 'Customer',
  'Barra': 'Bar',
  'Hervir agua': 'Boil water',
  'Extraer': 'Extract',
  'Servir': 'Serve',
  'Tapar': 'Put lid on',
  'Infusionar': 'Steep',
  'Entregar': 'Hand over',
  'Manga': 'Sleeve',
  'Preparar (hueco)': 'Prepare (hook)',
  'Armar taza': 'Build cup',
  'Receta': 'Recipe',
  'Template Method: un esqueleto fijo con huecos': 'Template Method: a fixed skeleton with hooks',
  'La receta común vive en la clase base: hervir, preparar, servir, tapar. Cada bebida solo rellena el paso que cambia. Nadie puede olvidar la tapa, y un paso nuevo se agrega una sola vez.': 'The common recipe lives in the base class: boil, brew, pour, put the lid on. Each drink only fills in the step that changes. Nobody can forget the lid, and a new step is added only once.',
  'Strategy es la versión por composición… si la usas en el paso correcto': 'Strategy is the composition version… if you use it at the right step',
  'Si la estrategia fuera solo el paso "preparar" y la receta común viviera en quien la usa, también funcionaría: es la alternativa por composición a Template Method. Pero aquí se eligió la receta completa como estrategia: dos algoritmos duplicados, y el té sigue sin tapa.': 'If the strategy were only the "prepare" step and the common recipe lived in whoever uses it, it would also work: it is the composition alternative to Template Method. But here the whole recipe was chosen as the strategy: two duplicated algorithms, and the tea still has no lid.',
  'Builder arma objetos, no comparte pasos': 'Builder builds objects, it doesn\'t share steps',
  'Armar la taza paso a paso antes de la receta no toca las dos copias de la receta. La del té sigue sin tapa.': 'Building the cup step by step before the recipe doesn\'t touch the two copies of the recipe. The tea one still has no lid.',
  'Todas las bebidas ahora llevan manga térmica.': 'All drinks now come with a thermal sleeve.',
  'Café': 'Coffee',
  'Té': 'Tea',
}

export default en
