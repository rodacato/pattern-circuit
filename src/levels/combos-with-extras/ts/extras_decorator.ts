// region: WithOatMilk
class WithOatMilk extends Product {
  constructor(private inner: Product) { super() }
  make() { const drink = this.inner.make(); drink.extras.push('oat'); return drink }
}
// endregion

// region: WithShot
class WithShot extends Product {
  constructor(private inner: Product) { super() }
  make() { const drink = this.inner.make(); drink.extras.push('shot'); return drink }
}
// endregion

class CoffeeMenu {
  static EXTRAS: Record<string, new (drink: Product) => Product> = { oat: WithOatMilk, shot: WithShot }

  // The combo's coffee is wrapped with each extra: it is still just another Product inside the combo.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return extras.reduce<Product>((drink, e) => new CoffeeMenu.EXTRAS[e](drink), new Latte()) }
  // endregion
}
