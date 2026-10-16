interface Pricing {
  cost(): number
}

// region: Latte
class Latte implements Drink {
  constructor(private extra: Pricing = new NoExtra()) {}
  cost() { return 45 + this.extra.cost() }
  description() { return 'Latte' }
}
// endregion

// Strategy picks ONE way to calculate: only one extra fits per drink here.
// region: OatMilkPricing
class OatMilkPricing implements Pricing {
  cost() { return 8 }
}
// endregion

// region: ShotPricing
class ShotPricing implements Pricing {
  cost() { return 10 }
}
// endregion

// region: CinnamonPricing
class CinnamonPricing implements Pricing {
  cost() { return 5 }
}
// endregion

class Menu {
  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    const pricing = ({ oat: OatMilkPricing, shot: ShotPricing, cinnamon: CinnamonPricing } as Record<string, new () => Pricing>)[request.extras[0]]
    return new Latte(new pricing()) // the second and third extras are lost
  }
  // endregion
}
