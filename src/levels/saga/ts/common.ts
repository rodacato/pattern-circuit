// --- the rest of the coffee shop ---
class Barista {
  private counter = new Counter()

  // region: Barista#prepare
  prepare(order: Order) { this.counter.handOver(order) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log('Ready!') }
  // endregion

  // region: Counter#notify
  notify(order: Order, message: string) { console.log(`${order.customer}: ${message}`) }
  // endregion
}
