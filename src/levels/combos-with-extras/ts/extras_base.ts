
class CoffeeMenu {
  // One subclass per combination of extras: the combo's coffee only supports one.
  // region: CoffeeMenu#drink_for
  drinkFor(extras: string[]): Product {
    // region: CoffeeMenu#drink_for:oat
    if (extras.includes('oat')) { return new OatMilkLatte()
    // endregion
    // region: CoffeeMenu#drink_for:shot
    } else if (extras.includes('shot')) { return new ShotLatte()
    // endregion
    // region: CoffeeMenu#drink_for:else
    } else { throw new Error('Which subclass is it?')
    // endregion
    }
  }
  // endregion
}
