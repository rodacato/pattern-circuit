// --- the rest of the coffee shop ---
type Order = { item: string }

interface Inventory {
  inStock(item: string): boolean
}

class OrderTaker {
  constructor(
    private inventory: Inventory,
    private barista: Barista,
  ) {}

  // region: OrderTaker#take
  take(order: Order) {
    if (!this.inventory.inStock(order.item)) return
    this.barista.prepare(order)
  }
  // endregion
}

// The warehouse is far away: each query takes time and serves one at a time.
class RemoteInventory implements Inventory {
  // region: RemoteInventory#in_stock?
  inStock(item: string) {
    sleep(2) // round trip to the warehouse
    return Warehouse.api.stock(item) > 0
  }
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
  handOver(order: Order) { console.log(`${order.item} ready!`) }
  // endregion
}
