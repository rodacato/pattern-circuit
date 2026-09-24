// Un solo modelo para todo: las pantallas y el mostrador hacen fila en el mismo lugar.
class OrderStore {
  private mutex = new Mutex()

  // region: OrderStore#handle
  handle(request: Request) {
    // region: OrderStore#handle:lectura
    if (request.isRead()) {
      return this.mutex.synchronize(() => ordersWithItemsAndCustomers()) // consulta pesada, una a la vez
    // endregion
    // region: OrderStore#handle:escritura
    } else {
      return this.mutex.synchronize(() => validateAndSave(request.order))
    // endregion
    }
  }
  // endregion
}
