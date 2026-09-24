
class CoffeeMenu {
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return new LegacyPos().lookup(extras.join('+')) } // el sistema viejo tampoco conoce la combinación
  // endregion
}
