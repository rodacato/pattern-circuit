class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}

// One subclass for each combination of extras.
// region: OatMilkLatte
class OatMilkLatte extends Latte {
  cost() { return super.cost() + 8 }
  description() { return 'Latte with oat' }
}
// endregion

// region: ShotLatte
class ShotLatte extends Latte {
  cost() { return super.cost() + 10 }
  description() { return 'Latte with shot' }
}
// endregion

// region: OatShotLatte
class OatShotLatte extends Latte {
  cost() { return super.cost() + 18 }
  description() { return 'Latte with oat and shot' }
}
// endregion

// region: CaramelLatte
class CaramelLatte extends Latte {
  cost() { return super.cost() + 7 }
  description() { return 'Latte with caramel' }
}
// endregion

class Menu {
  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    // region: Menu#drink_for:combo:oat
    switch (request.extras.join('+')) {
    case 'oat': return new OatMilkLatte()
    // endregion
    // region: Menu#drink_for:combo:shot
    case 'shot': return new ShotLatte()
    // endregion
    // region: Menu#drink_for:combo:oat-shot
    case 'oat+shot': return new OatShotLatte()
    // endregion
    // region: Menu#drink_for:combo:caramel
    case 'caramel': return new CaramelLatte() // ← and all its combinations are missing
    // endregion
    // region: Menu#drink_for:else
    default: throw new Error('There is no OatShotCinnamonLatte class') // 3 extras = 8 classes; 4 extras = 16…
    // endregion
    }
  }
  // endregion
}
