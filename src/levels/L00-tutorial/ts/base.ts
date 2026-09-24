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
  // region: Barista#prepare
  prepare(order: Order) {
    console.log(`Preparando ${order.drink}...`)
    // ¿y ahora a quién se la entrego? Falta un cable.
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
const taker = new OrderTaker(new Cashier(new Barista()))
taker.take('espresso')
// endregion
