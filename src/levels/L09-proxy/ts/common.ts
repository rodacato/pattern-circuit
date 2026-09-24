// --- el resto de la cafetería ---
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

// El almacén está lejos: cada consulta tarda y atiende de a una.
class RemoteInventory implements Inventory {
  // region: RemoteInventory#in_stock?
  inStock(item: string) {
    sleep(2) // viaje de ida y vuelta al almacén
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
  handOver(order: Order) { console.log(`¡${order.item} listo!`) }
  // endregion
}
