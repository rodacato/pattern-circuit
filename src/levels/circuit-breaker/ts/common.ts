// --- the rest of the coffee shop ---
interface Gateway {
  charge(order: Order): unknown
}

class Cashier {
  constructor(private gateway: Gateway) {}

  // region: Cashier#charge
  charge(order: Order) { return this.gateway.charge(order) }
  // endregion
}

class OfflinePayments implements Gateway {
  private pending: Order[] = []

  // Fallback: records the charge and processes it when the provider is back.
  // region: OfflinePayments#charge
  charge(order: Order) { this.pending.push(order) }
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
  handOver(order: Order) { console.log('Ready!') }
  // endregion
}
