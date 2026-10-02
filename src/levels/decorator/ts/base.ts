class Menu {
  // region: Menu#drink_for
  drinkFor(request: DrinkRequest): Drink {
    // region: Menu#drink_for:combo:avena
    switch (request.extras.join('+')) {
    case 'avena': return new LatteConAvena()
    // endregion
    // region: Menu#drink_for:combo:shot
    case 'shot': return new LatteConShot()
    // endregion
    // region: Menu#drink_for:combo:avena-shot
    case 'avena+shot': return new LatteConAvenaYShot()
    // endregion
    // region: Menu#drink_for:else
    default: throw new Error('No existe la clase LatteConAvenaShotYCanela') // 3 extras = 8 clases; 4 extras = 16…
    // endregion
    }
  }
  // endregion
}
