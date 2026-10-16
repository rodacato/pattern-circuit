
class CoffeeMenu {
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return new LegacyPos().lookup(extras.join('+')) } // the old system does not know the combination either
  // endregion
}
