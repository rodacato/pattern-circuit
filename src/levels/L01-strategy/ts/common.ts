// --- el resto de la cafetería no cambia en este nivel ---
type Order = { drink: string; payment: string; total: number }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(drink: string, payment: string) {
    this.cashier.charge({ drink, payment, total: 45 })
  }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(order: Order) {
    this.counter.handOver(order)
  }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) {
    console.log(`¡${order.drink} listo!`)
  }
  // endregion
}
