type Item = Product | Combo

class Product {
  // region: Product#make
  make() { return this }
  // endregion
}

// region: Combo
class Combo {
  // region: Combo#items
  readonly items: Item[]
  // endregion

  constructor(...items: Item[]) { this.items = items }
}
// endregion

class Kitchen {
  constructor(private tray: Tray) {}

  // The kitchen asks what each thing is… and can only go down one level.
  // region: Kitchen#prepare
  prepare(item: Item) {
    // region: Kitchen#prepare:product
    if (item instanceof Product) {
      this.tray.collect([item.make()])
    // endregion
    // region: Kitchen#prepare:combo
    } else if (item instanceof Combo) {
      item.items.forEach((child) => {
        if (child instanceof Combo) throw new Error('A combo inside a combo?')
        this.tray.collect([child.make()])
      })
    // endregion
    }
  }
  // endregion
}
