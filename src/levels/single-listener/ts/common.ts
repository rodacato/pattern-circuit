// --- el resto de la cafetería no cambia en este nivel ---
type Order = { drink: string }

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(drink: string) { this.cashier.charge({ drink }) }
  // endregion
}

class Kitchen {
  constructor(private counter: Counter) {}

  // region: Kitchen#start
  start(order: Order) { this.counter.handOver(order) }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) { console.log(`¡${order.drink} listo!`) }
  // endregion
}
