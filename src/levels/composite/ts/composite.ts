// Hoja y grupo responden al mismo mensaje: `make`.
interface Item {
  make(): Product[]
}

class Product implements Item {
  // region: Product#make
  make() { return [this] }
  // endregion
}

class Combo implements Item {
  private items: Item[]

  constructor(...items: Item[]) { this.items = items }

  // Un combo prepara lo suyo pidiéndole `make` a cada parte, sea producto o combo.
  // region: Combo#make
  make() { return this.items.flatMap((item) => item.make()) }
  // endregion
}

class Kitchen {
  constructor(private tray: Tray) {}

  // Ni un if: la cocina ya no pregunta qué es cada cosa.
  // region: Kitchen#prepare
  prepare(item: Item) { this.tray.collect(item.make()) }
  // endregion
}
