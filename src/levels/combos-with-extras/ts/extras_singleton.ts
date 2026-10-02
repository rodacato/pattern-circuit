
class CoffeeMenu {
  private static shared?: CoffeeMenu
  static instance() { return (CoffeeMenu.shared ??= new CoffeeMenu()) }

  // A single shared menu… that still picks only one subclass.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return extras.includes('oat') ? new OatMilkLatte() : new ShotLatte() }
  // endregion
}
