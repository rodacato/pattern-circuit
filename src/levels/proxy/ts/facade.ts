// A facade with a single door… that calls the warehouse just as often.
// region: StockDesk#in_stock?
class StockDesk implements Inventory {
  constructor(private inventory: Inventory) {}
  inStock(item: string) { return this.inventory.inStock(item) }
}
// endregion

// region: wiring
const taker = new OrderTaker(new StockDesk(new RemoteInventory()), barista)
// endregion
