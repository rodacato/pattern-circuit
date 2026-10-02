// A single interested party: Cashier calls it directly and the flow reads straight through.
class Cashier {
  constructor(private kitchen: Kitchen) {}

  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    this.kitchen.start(order)
  }
  // endregion
}

// region: wiring
new OrderTaker(new Cashier(new Kitchen(new Counter()))).take('latte')
// endregion
