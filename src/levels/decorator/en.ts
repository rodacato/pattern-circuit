import type { Catalog } from '../../i18n'

// Traducción al inglés del contenido de este nivel (texto en español → inglés).
const en: Catalog = {
  'Extras sin fin': 'Endless extras',
  'Cada combinación de extras es una subclase: LatteConAvena, LatteConShot, LatteConAvenaYShot… Alguien pidió avena, shot y canela y esa clase no existe.': 'Every combination of extras is a subclass: LatteConAvena, LatteConShot, LatteConAvenaYShot… Someone ordered oat milk, an extra shot and cinnamon, and that class doesn\'t exist.',
  'Que cualquier combinación de extras funcione y que un extra nuevo no obligue a tocar el menú.': 'Make any combination of extras work, and make a new extra not require touching the menu.',
  'Cliente': 'Customer',
  'Tomar pedido': 'Take order',
  'Menú': 'Menu',
  'Con avena': 'With oat milk',
  'Con shot': 'With extra shot',
  'Avena y shot': 'Oat milk and shot',
  'Preparar': 'Prepare',
  'Entregar': 'Hand over',
  'Con caramelo': 'With caramel',
  'Latte': 'Latte',
  'Con canela': 'With cinnamon',
  'Precio avena': 'Oat milk price',
  'Precio shot': 'Shot price',
  'Precio canela': 'Cinnamon price',
  'Adaptador': 'Adapter',
  'Extras': 'Extras',
  'Decorator: envolturas que se apilan': 'Decorator: wrappers that stack',
  'Cada extra es una envoltura que suma su precio y su descripción y delega el resto. Se apilan en cualquier orden y cantidad: tres extras son tres envolturas, no ocho subclases.': 'Each extra is a wrapper that adds its price and its description and delegates the rest. They stack in any order and amount: three extras are three wrappers, not eight subclasses.',
  'Strategy elige una, Decorator acumula': 'Strategy picks one, Decorator stacks up',
  'La bebida recibe una estrategia de precio… una sola. Con dos o tres extras, todos menos el primero se pierden.': 'The drink gets a pricing strategy… just one. With two or three extras, all but the first are lost.',
  'Adapter traduce, no compone': 'Adapter translates, it doesn\'t compose',
  'Adaptar el pedido al punto de venta viejo cambia el formato, pero el sistema viejo tampoco conoce la combinación con tres extras.': 'Adapting the order to the old point of sale changes the format, but the old system doesn\'t know the three-extra combination either.',
  'Nuevo extra en el menú: caramelo.': 'New extra on the menu: caramel.',
  'Latte + avena': 'Latte + oat milk',
  'Latte + shot': 'Latte + shot',
  'Latte + avena + shot': 'Latte + oat milk + shot',
  'Latte + avena + shot + canela': 'Latte + oat milk + shot + cinnamon',
  'Latte + caramelo + shot': 'Latte + caramel + shot',
}

export default en
