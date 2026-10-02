class Menu {
  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    return new LegacyMenuAdapter(new OldPos()).drinkFor(request)
  }
  // endregion
}

// Translates the request to the old POS format… which doesn't know combinations either.
// region: LegacyMenuAdapter
class LegacyMenuAdapter {
  constructor(private pos: OldPos) {}
  drinkFor(request: DrinkRequest): Drink { return this.pos.lookup(request.extras.join('+')) }
}
// endregion
