// --- productos y el resto de la cafetería ---
type Order = { branch: string }

// region: Latte
class Latte {}
// endregion
// region: Frappe
class Frappe {}
// endregion
// region: HotChocolate
class HotChocolate {}
// endregion
// region: IcedTea
class IcedTea {}
// endregion

class OrderTaker {
  constructor(private branches: Record<string, { take(order: Order): void }>) {}

  // region: OrderTaker#take
  take(order: Order) {
    this.branches[order.branch].take(order)
  }
  // endregion
}

class Barista {
  constructor(private counter: Counter) {}

  // region: Barista#prepare
  prepare(drink: object) {
    this.counter.handOver(drink)
  }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(drink: object) {
    console.log(`¡${drink.constructor.name} listo!`)
  }
  // endregion
}
