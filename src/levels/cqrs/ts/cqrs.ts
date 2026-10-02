// Escribir y leer por caminos distintos.
class PlaceOrder {
  constructor(private events: EventBus) {}

  // Lado de escritura: valida reglas del negocio, una orden a la vez.
  // region: PlaceOrder#call
  call(command: PlaceOrderCommand) {
    if (!command.isValid()) throw new InvalidOrder() // reglas del negocio, solo en el lado de escritura
    const order = Order.create(command.attributes)
    this.events.publish('order_placed', order)
  }
  // endregion
}

// region: BoardProjection#on_order_placed
class BoardProjection {
  constructor(private boardView: BoardView) {}

  // Cada cambio actualiza una vista ya lista para leer.
  onOrderPlaced(order: Order) { this.boardView.upsert(order.summary) }
}
// endregion

// region: BoardQuery#call
class BoardQuery {
  constructor(private boardView: BoardView) {}

  // Lado de lectura: una tabla plana, sin joins ni bloqueos. Rápida y sin fila.
  call() { return this.boardView.all() }
}
// endregion
