
// A single desk in front of the store: everyone goes through it into the same queue.
// region: OrdersDesk
class OrdersDesk {
  handle(request: Request) { return new OrderStore().handle(request) }
}
// endregion
