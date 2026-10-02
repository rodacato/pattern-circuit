// Mismo contrato que RemoteInventory; solo va al almacén si no conoce la respuesta.
// region: CachedInventory#in_stock?
class CachedInventory implements Inventory {
  private known: Record<string, boolean> = {}
  constructor(private real: Inventory) {}

  inStock(item: string) {
    return (this.known[item] ??= this.real.inStock(item))
  }
}
// endregion

// OrderTaker no se entera del cambio: recibe algo que responde igual.
// region: wiring
const taker = new OrderTaker(new CachedInventory(new RemoteInventory()), barista)
// endregion
