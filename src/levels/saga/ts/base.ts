class PlaceOrder {
  // Three steps, each in its own service: there is no transaction wrapping them all.
  // region: PlaceOrder#call
  call(order: Order) {
    Payments.charge(order)          // 1. charge (no way back now)
    Inventory.reserve(order)        // 2. out of oat? OutOfStock… and the customer already paid
    new Barista().prepare(order)     // 3.
  }
  // endregion
}

// region: Payments.charge
const Payments = {
  charge(order: Order) { return Gateway.charge(order.total) },
}
// endregion

// region: Inventory.reserve
const Inventory = {
  reserve(order: Order) { if (!Stock.isAvailable(order.items)) throw new OutOfStock() },
}
// endregion
