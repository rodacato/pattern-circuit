
class CoffeeMenu {
  private static shared?: CoffeeMenu
  static instance() { return (CoffeeMenu.shared ??= new CoffeeMenu()) }

  // Un único menú compartido… que sigue eligiendo una sola subclase.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]) { return extras.includes('avena') ? new LatteConAvena() : new LatteConShot() }
  // endregion
}
