abstract class Branch {
  constructor(private barista: Barista) {}

  // The flow is the same for all of them; only `createDrink` changes.
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

// region: HarborBranch#create_drink
class HarborBranch extends Branch { // ← new branch: one subclass, nothing else
  createDrink() { return new IcedTea() }
}
// endregion
