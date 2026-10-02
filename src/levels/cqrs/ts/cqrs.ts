// Write and read through different paths.
class PlaceOrder {
  constructor(private events: EventBus) {}

  // Write side: validates business rules, one order at a time.
  // region: PlaceOrder#call
  call(command: PlaceOrderCommand) {
    if (!command.isValid()) throw new InvalidOrder() // business rules, only on the write side
    const order = Order.create(command.attributes)
    this.events.publish('order_placed', order)
  }
  // endregion
}

// region: BoardProjection#on_order_placed
class BoardProjection {
  constructor(private boardView: BoardView) {}

  // Each change updates a view that is already ready to read.
  onOrderPlaced(order: Order) { this.boardView.upsert(order.summary) }
}
// endregion

// region: BoardQuery#call
class BoardQuery {
  constructor(private boardView: BoardView) {}

  // Read side: a flat table, no joins or locks. Fast and no queue.
  call() { return this.boardView.all() }
}
// endregion
