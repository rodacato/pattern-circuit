// Una fachada con una sola puerta… que llama igual de seguido al almacén.
// region: StockDesk#in_stock?
class StockDesk implements Inventory {
  constructor(private inventory: Inventory) {}
  inStock(item: string) { return this.inventory.inStock(item) }
}
// endregion

// region: wiring
const taker = new OrderTaker(new StockDesk(new RemoteInventory()), barista)
// endregion
