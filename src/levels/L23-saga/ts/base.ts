class PlaceOrder {
  // Tres pasos, cada uno en su propio servicio: no hay una transacción que los envuelva a todos.
  // region: PlaceOrder#call
  call(order: Order) {
    Payments.charge(order)          // 1. se cobra (ya no hay vuelta atrás)
    Inventory.reserve(order)        // 2. ¿sin avena? OutOfStock… y el cliente ya pagó
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
