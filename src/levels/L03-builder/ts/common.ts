// --- el resto de la cafetería ---
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

  // La cocina es el último lugar donde descubrir que un pedido era imposible: ya se cobró.
  // region: Barista#prepare
  prepare(order: Order) {
    if (order.isHot() && order.isIced()) throw new Error('¿Hielo en una bebida hirviendo?')
    this.counter.handOver(order)
  }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(order: Order) {
    console.log(`¡${order.name} listo!`)
  }
  // endregion

  // region: Counter#notify
  notify(message: string) {
    console.log(`Antes de cobrar: ${message}`)
  }
  // endregion
}
