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
    // region: Menu#drink_for:else
    default: throw new Error('There is no OatShotCinnamonLatte class') // 3 extras = 8 classes; 4 extras = 16…
    // endregion
    }
  }
  // endregion
}
