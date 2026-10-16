// --- the rest of the coffee shop ---
class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order.total)
    this.barista.prepare(order)
  }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // The kitchen is the last place to find out an order was impossible: it was already charged.
  // region: Barista#prepare
  prepare(order: Order) {
    if (order.isHot() && order.isIced()) throw new Error('Ice in a boiling drink?')
    this.counter.handOver(order)
  }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) {
    console.log(`${order.name} ready!`)
  }
  // endregion

  // region: Counter#notify
  notify(message: string) {
    console.log(`Before charging: ${message}`)
  }
  // endregion
}
