// Same contract as RemoteInventory; only goes to the warehouse if it doesn't know the answer.
// region: CachedInventory#in_stock?
class CachedInventory implements Inventory {
  private known: Record<string, boolean> = {}
  constructor(private real: Inventory) {}

  inStock(item: string) {
    return (this.known[item] ??= this.real.inStock(item))
  }
}
// endregion

// OrderTaker doesn't notice the change: it gets something that answers the same.
// region: wiring
const taker = new OrderTaker(new CachedInventory(new RemoteInventory()), barista)
// endregion
