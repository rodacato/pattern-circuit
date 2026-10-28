// region: WithOatMilk
class WithOatMilk extends Product {
  constructor(private inner: Product) { super() }
  make() { const parts = this.inner.make(); parts[parts.length - 1].extras.push('oat'); return parts }
}
// endregion

// region: WithShot
class WithShot extends Product {
  constructor(private inner: Product) { super() }
  make() { const parts = this.inner.make(); parts[parts.length - 1].extras.push('shot'); return parts }
}
// endregion

class CoffeeMenu {
  static EXTRAS: Record<string, new (drink: Product) => Product> = { oat: WithOatMilk, shot: WithShot }

  // The combo's coffee is wrapped with each extra: it is still just another Product inside the combo.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return extras.reduce<Product>((drink, e) => new CoffeeMenu.EXTRAS[e](drink), new Latte()) }
  // endregion
}
