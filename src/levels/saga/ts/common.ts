// --- el resto de la cafetería ---
class Barista {
  private counter = new Counter()

  // region: Barista#prepare
  prepare(order: Order) { this.counter.handOver(order) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log('¡Listo!') }
  // endregion

  // region: Counter#notify
  notify(order: Order, message: string) { console.log(`${order.customer}: ${message}`) }
  // endregion
}
