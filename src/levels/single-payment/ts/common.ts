// --- the rest of the coffee shop doesn't change in this level ---
type Order = { drink: string; price: number }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(drink: string, price: number) { this.cashier.charge({ drink, price }) }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(order: Order) { this.counter.handOver(order) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log(`${order.drink} ready!`) }
  // endregion
}
