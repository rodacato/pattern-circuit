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

// Strategy elige UNA forma de calcular: aquí solo cabe un extra por bebida.
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
    const pricing = ({ avena: OatMilkPricing, shot: ShotPricing, canela: CinnamonPricing } as Record<string, new () => Pricing>)[request.extras[0]]
    return new Latte(new pricing()) // el segundo y tercer extra se pierden
  }
  // endregion
}
