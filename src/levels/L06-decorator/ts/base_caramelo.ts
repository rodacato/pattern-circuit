class Latte implements Drink {
  cost() { return 45 }
  description() { return 'Latte' }
}

// Una subclase por cada combinación de extras.
// region: LatteConAvena
class LatteConAvena extends Latte {
  cost() { return super.cost() + 8 }
  description() { return 'Latte con avena' }
}
// endregion

// region: LatteConShot
class LatteConShot extends Latte {
  cost() { return super.cost() + 10 }
  description() { return 'Latte con shot' }
}
// endregion

// region: LatteConAvenaYShot
class LatteConAvenaYShot extends Latte {
  cost() { return super.cost() + 18 }
  description() { return 'Latte con avena y shot' }
}
// endregion

// region: LatteConCaramelo
class LatteConCaramelo extends Latte {
  cost() { return super.cost() + 7 }
  description() { return 'Latte con caramelo' }
}
// endregion

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
    // region: Menu#drink_for:combo:caramelo
    case 'caramelo': return new LatteConCaramelo() // ← y faltan todas sus combinaciones
    // endregion
    // region: Menu#drink_for:else
    default: throw new Error('No existe la clase LatteConAvenaShotYCanela') // 3 extras = 8 clases; 4 extras = 16…
    // endregion
    }
  }
  // endregion
}
