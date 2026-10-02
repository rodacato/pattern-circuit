// region: WithOatMilk
class WithOatMilk extends Product {
  constructor(private inner: Product) { super() }
  make() { const drink = this.inner.make(); drink.extras.push('avena'); return drink }
}
// endregion

// region: WithShot
class WithShot extends Product {
  constructor(private inner: Product) { super() }
  make() { const drink = this.inner.make(); drink.extras.push('shot'); return drink }
}
// endregion

class CoffeeMenu {
  static EXTRAS: Record<string, new (drink: Product) => Product> = { avena: WithOatMilk, shot: WithShot }

  // El café del combo se envuelve con cada extra: sigue siendo un Product más dentro del combo.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return extras.reduce<Product>((drink, e) => new CoffeeMenu.EXTRAS[e](drink), new Latte()) }
  // endregion
}
