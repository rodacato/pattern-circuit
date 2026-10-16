// A single model for everything: the screens and the counter queue up in the same place.
class OrderStore {
  private mutex = new Mutex()

  // region: OrderStore#handle
  handle(request: Request) {
    // region: OrderStore#handle:read
    if (request.isRead()) {
      return this.mutex.synchronize(() => ordersWithItemsAndCustomers()) // heavy query, one at a time
    // endregion
    // region: OrderStore#handle:write
    } else {
      return this.mutex.synchronize(() => validateAndSave(request.order))
    // endregion
    }
  }
  // endregion
}
