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
    console.log(`Cobrado: ${order.drink}`)
    this.barista.prepare(order)
  }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(order: Order) {
    console.log(`Preparando ${order.drink}...`)
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

// region: wiring
// Cada `new` es un cable: así se ve el circuito en código.
const taker = new OrderTaker(new Cashier(new Barista(new Counter())))
taker.take('espresso')
// endregion
