// Only the kitchen needs to know an order was charged… and nobody tells it.
class Cashier {
  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    // and the kitchen? The order is left waiting.
  }
  // endregion
}

// region: wiring
new OrderTaker(new Cashier()).take('latte')
// endregion
