abstract class Branch {
  constructor(private barista: Barista) {}

  // El flujo es el mismo para todas; solo `createDrink` cambia.
  // region: Branch#take
  take(order: Order) {
    const drink = this.createDrink()
    this.barista.prepare(drink)
  }
  // endregion

  abstract createDrink(): object
}

class CentroBranch extends Branch {
  // region: CentroBranch#create_drink
  createDrink() { return new Latte() }
  // endregion
}

class PlayaBranch extends Branch {
  // region: PlayaBranch#create_drink
  createDrink() { return new Frappe() }
  // endregion
}

class MontanaBranch extends Branch {
  // region: MontanaBranch#create_drink
  createDrink() { return new HotChocolate() }
  // endregion
}
