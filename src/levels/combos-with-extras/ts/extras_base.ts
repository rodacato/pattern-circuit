
class CoffeeMenu {
  // Una subclase por combinación de extras: el café del combo solo admite una.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]): Product {
    // region: CoffeeMenu#drink_for:avena
    if (extras.includes('avena')) { return new LatteConAvena()
    // endregion
    // region: CoffeeMenu#drink_for:shot
    } else if (extras.includes('shot')) { return new LatteConShot()
    // endregion
    // region: CoffeeMenu#drink_for:else
    } else { throw new Error('¿Qué subclase le toca?')
    // endregion
    }
  }
  // endregion
}

// region: LatteConAvena
class LatteConAvena extends Product {}
// endregion

// region: LatteConShot
class LatteConShot extends Product {}
// endregion
