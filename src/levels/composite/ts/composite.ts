// Leaf and group answer the same message: `make`.
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

  // A combo makes its own by asking each part for `make`, whether product or combo.
  // region: Combo#make
  make() { return this.items.flatMap((item) => item.make()) }
  // endregion
}

class Kitchen {
  constructor(private tray: Tray) {}

  // Not a single if: the kitchen no longer asks what each thing is.
  // region: Kitchen#prepare
  prepare(item: Item) { this.tray.collect(item.make()) }
  // endregion
}
