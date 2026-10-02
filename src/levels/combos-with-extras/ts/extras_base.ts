
class CoffeeMenu {
  // Una subclase por combinación de extras: el café del combo solo admite una.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]): Product {
    // region: CoffeeMenu#drink_for:avena
    if (extras.includes('avena')) { return new OatMilkLatte()
    // endregion
    // region: CoffeeMenu#drink_for:shot
    } else if (extras.includes('shot')) { return new ShotLatte()
    // endregion
    // region: CoffeeMenu#drink_for:else
    } else { throw new Error('¿Qué subclase le toca?')
    // endregion
    }
  }
  // endregion
}

// region: OatMilkLatte
class OatMilkLatte extends Product {}
// endregion

// region: ShotLatte
class ShotLatte extends Product {}
// endregion
