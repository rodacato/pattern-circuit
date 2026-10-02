class Order {
  // region: Order#initialize
  constructor(private size: string, private temp: string) {}
  // endregion
}

// Extras stack as named wrappers: they no longer get swapped.
// region: WithMilk
class WithMilk {
  constructor(private inner: Order, private milk: string) {}
}
// endregion

// region: WithSyrup
class WithSyrup {
  constructor(private inner: Order | WithMilk, private syrup: string) {}
}
// endregion

class WithIce {
  constructor(private inner: Order) {}
  isIced() { return true }
}

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // …but nobody checks the whole order: hot + ice gets through and blows up in the kitchen.
  // region: OrderTaker#take
  take(request: OrderRequest) {
    const order = new WithSyrup(new WithMilk(new Order('large', 'hot'), 'oat'), 'vanilla')
    this.cashier.charge(order)
  }
  // endregion
}
