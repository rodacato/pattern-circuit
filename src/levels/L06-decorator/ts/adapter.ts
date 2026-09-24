class Menu {
  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    return new LegacyMenuAdapter(new OldPos()).drinkFor(request)
  }
  // endregion
}

// Traduce el pedido al formato del punto de venta viejo… que tampoco conoce combinaciones.
// region: LegacyMenuAdapter
class LegacyMenuAdapter {
  constructor(private pos: OldPos) {}
  drinkFor(request: DrinkRequest): Drink { return this.pos.lookup(request.extras.join('+')) }
}
// endregion
