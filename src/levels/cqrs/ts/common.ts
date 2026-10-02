// --- who reads and who writes ---
class OrderBoard {
  // region: OrderBoard#show
  show(orders: OrderSummary[]) { render(orders) } // the screens ask all the time
  // endregion
}

class Counter {
  // region: Counter#saved
  saved(order: Order) { console.log(`Order ${order.id} saved`) }
  // endregion
}
