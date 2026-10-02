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

class DowntownBranch extends Branch {
  // region: DowntownBranch#create_drink
  createDrink() { return new Latte() }
  // endregion
}

class BeachBranch extends Branch {
  // region: BeachBranch#create_drink
  createDrink() { return new Frappe() }
  // endregion
}

class MountainBranch extends Branch {
  // region: MountainBranch#create_drink
  createDrink() { return new HotChocolate() }
  // endregion
}
