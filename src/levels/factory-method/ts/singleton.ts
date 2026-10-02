class DrinkFactory {
  private static _instance?: DrinkFactory

  // One single factory for all the branches.
  static get instance() { return (this._instance ??= new DrinkFactory()) }

  // region: DrinkFactory#create
  create() {
    return new Latte() // the single instance does not know which branch the order comes from
  }
  // endregion
}

class OrderFlow {
  constructor(private barista: Barista) {}
  take(order: Order) { this.barista.prepare(DrinkFactory.instance.create()) }
}
