type Order = { drink: string }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(drink: string) {
    this.cashier.charge({ drink })
  }
  // endregion
}

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    console.log(`Charged: ${order.drink}`)
    this.barista.prepare(order)
  }
  // endregion
}

class Barista {
  // region: Barista#prepare
  prepare(order: Order) {
    console.log(`Preparing ${order.drink}...`)
    // and now who do I hand it to? A wire is missing.
  }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) {
    console.log(`${order.drink} ready!`)
  }
  // endregion
}

// region: wiring
const taker = new OrderTaker(new Cashier(new Barista()))
taker.take('espresso')
// endregion
